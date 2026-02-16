using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.RateLimiting;

using Gym3000.Api.Data;
using Gym3000.Api.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ========================== DB =========================================
string? raw = Environment.GetEnvironmentVariable("DATABASE_URL");
string connStr = !string.IsNullOrWhiteSpace(raw)
    ? (raw.Contains("://", StringComparison.OrdinalIgnoreCase) ? ToNpgsqlConnString(raw) : raw)
    : builder.Configuration.GetConnectionString("Default")
      ?? throw new InvalidOperationException("No DB connection string");

if (builder.Environment.IsProduction()
    && !connStr.Contains("SSL Mode", StringComparison.OrdinalIgnoreCase))
{
    connStr += (connStr.EndsWith(";") ? "" : ";") + "SSL Mode=Require;Trust Server Certificate=true;";
}

builder.Services.AddDbContext<ApplicationDbContext>(opt => opt.UseNpgsql(connStr));

static string ToNpgsqlConnString(string url)
{
    var uri = new Uri(url);
    var userInfo = uri.UserInfo.Split(':', 2);
    var user = Uri.UnescapeDataString(userInfo[0]);
    var pass = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";

    var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
    var sslmode = query["sslmode"];

    var cs = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={user};Password={pass};";
    if (!string.IsNullOrWhiteSpace(sslmode))
        cs += $"SSL Mode={sslmode};";
    if (!cs.Contains("Trust Server Certificate", StringComparison.OrdinalIgnoreCase))
        cs += "Trust Server Certificate=true;";
    return cs;
}

// ========================== Identity ====================================
builder.Services
    .AddIdentityCore<IdentityUser>(opt =>
    {
        opt.User.RequireUniqueEmail = true;

        // ✅ FIX: erlaubt Punkte/Plus/etc. in Username (du setzt Username = Email)
        opt.User.AllowedUserNameCharacters =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

        opt.Password.RequiredLength = 8;
        opt.Password.RequireDigit = true;
        opt.Password.RequireUppercase = true;
        opt.Password.RequireLowercase = true;
        opt.Password.RequireNonAlphanumeric = false;
        opt.Lockout.AllowedForNewUsers = true;
        opt.Lockout.MaxFailedAccessAttempts = 5;
        opt.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
    })
    .AddEntityFrameworkStores<ApplicationDbContext>();

// ========================== CORS ========================================
string originsCsv = builder.Configuration["AllowedOrigins"] ?? "";
var parsed = originsCsv
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Where(o => o.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || o.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
    .Select(o => o.Trim())
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p =>
    {
        if (parsed.Length > 0)
        {
            p.WithOrigins(parsed)
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials();
        }
        else
        {
            p.SetIsOriginAllowed(origin =>
            {
                try
                {
                    var uri = new Uri(origin);
                    var host = uri.Host.ToLowerInvariant();
                    return host.EndsWith("vercel.app")
                        || host == "trackyourgains.de"
                        || host == "www.trackyourgains.de"
                        || host == "localhost";
                }
                catch { return false; }
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        }
    });
});

// ========================== JWT ========================================
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()
          ?? throw new InvalidOperationException("Missing Jwt config");

// Key-Härtung: mindestens 32 Byte
var keyBytes = Encoding.UTF8.GetBytes(jwt.Key ?? "");
if (keyBytes.Length < 32)
    throw new InvalidOperationException("Jwt.Key must be at least 32 bytes (use a long random secret).");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,                  // wichtig
            RequireExpirationTime = true,             // wichtig
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            NameClaimType = JwtRegisteredClaimNames.Sub,
            RoleClaimType = "role",
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Beispiel-Policy:
    // options.AddPolicy("mfa", p => p.RequireClaim("mfa", "true"));
});

builder.Services.AddScoped<IJwtService, JwtService>();

// ========================== RateLimiting ================================
// differenzierte Policies + klare 429-Antwort
builder.Services.AddRateLimiter(opt =>
{
    opt.RejectionStatusCode = 429;
    opt.OnRejected = async (ctx, token) =>
    {
        ctx.HttpContext.Response.ContentType = "application/json";
        await ctx.HttpContext.Response.WriteAsync("""
            {"message":"Zu viele Versuche. Bitte später nochmal probieren."}
            """, token);
    };

    opt.AddPolicy("auth-login", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,               // 5/min
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    opt.AddPolicy("auth-register", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,               // 3/min
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    opt.AddPolicy("auth-changeemail", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,               // moderat
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    opt.AddPolicy("auth-changepw", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,               // 5/min
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    // NEU: generische Policy für Refresh / Logout
    opt.AddPolicy("auth", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,              // etwas lockerer
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

builder.Services
    .AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    }); builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Gym3000.Api", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ========================== DB migrate + seed ==========================
using (var scope = app.Services.CreateScope())
{
    var sp = scope.ServiceProvider;
    var logger = sp.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

    try
    {
        var db = sp.GetRequiredService<ApplicationDbContext>();

        // 1) Migrationen anwenden (Railway DB bekommt sonst keine neuen Tabellen)
        await db.Database.MigrateAsync();

        // 2) Seed laden (nur wenn noch leer)
        await Gym3000.Api.Data.Seed.GlycemicFoodsSeeder.SeedAsync(db, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Startup migrate/seed failed");
        // optional: throw;  // wenn du willst dass App hart failt statt "halb kaputt" läuft
    }
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});
var swaggerEnabled = app.Environment.IsDevelopment()
    || string.Equals(Environment.GetEnvironmentVariable("ENABLE_SWAGGER"), "true", StringComparison.OrdinalIgnoreCase);

if (swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

// CORS zuerst
app.UseCors("frontend");

// RateLimiter, Auth
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// ========================== OPTIONS Preflight ===========================
app.MapMethods("/api/{**any}", new[] { "OPTIONS" }, (HttpContext ctx) => Results.Ok());

// ========================== Controller-Routing ==========================
app.MapControllers();

// Debug Route Dump
app.MapGet("/routes", (Microsoft.AspNetCore.Routing.EndpointDataSource eds) =>
{
    var routes = eds.Endpoints
        .Select(e => new
        {
            Pattern = (e as Microsoft.AspNetCore.Routing.RouteEndpoint)?.RoutePattern?.RawText,
            Methods = e.Metadata.OfType<Microsoft.AspNetCore.Routing.HttpMethodMetadata>()
                                .FirstOrDefault()?.HttpMethods
        });
    return Results.Json(routes);
});

app.Run();
