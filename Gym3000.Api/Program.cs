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

var builder = WebApplication.CreateBuilder(args);

// ---- DB (Railway: DATABASE_URL normalisieren) ----
string? raw = Environment.GetEnvironmentVariable("DATABASE_URL");

// Falls raw eine URL ist (postgres:// oder postgresql://) -> umwandeln.
// Falls raw bereits ein ConnString ist -> direkt verwenden.
// Falls nix da -> ConnectionStrings:Default aus appsettings.
string connStr = !string.IsNullOrWhiteSpace(raw)
    ? (raw.Contains("://", StringComparison.OrdinalIgnoreCase) ? ToNpgsqlConnString(raw) : raw)
    : builder.Configuration.GetConnectionString("Default")
      ?? throw new InvalidOperationException("No DB connection string");

// In Production SSL sicherstellen
if (builder.Environment.IsProduction()
    && !connStr.Contains("SSL Mode", StringComparison.OrdinalIgnoreCase))
{
    connStr += (connStr.EndsWith(";") ? "" : ";") + "SSL Mode=Require;Trust Server Certificate=true;";
}

builder.Services.AddDbContext<ApplicationDbContext>(opt => opt.UseNpgsql(connStr));

// --- Helper: URL -> Npgsql ConnectionString ---
static string ToNpgsqlConnString(string url)
{
    var uri = new Uri(url); // akzeptiert postgres:// oder postgresql://
    var userInfo = uri.UserInfo.Split(':', 2);
    var user = Uri.UnescapeDataString(userInfo[0]);
    var pass = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";

    // Query-Params (z.B. ?sslmode=require)
    var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
    var sslmode = query["sslmode"];

    var cs = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={user};Password={pass};";

    if (!string.IsNullOrWhiteSpace(sslmode))
        cs += $"SSL Mode={sslmode};";

    if (!cs.Contains("Trust Server Certificate", StringComparison.OrdinalIgnoreCase))
        cs += "Trust Server Certificate=true;";

    return cs;
}

// ---- Identity (cookie-less) + Policies anziehen ----
builder.Services
    .AddIdentityCore<IdentityUser>(opt =>
    {
        opt.User.RequireUniqueEmail = true;
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

// ---- CORS: aus Env "AllowedOrigins" (CSV). Fallback: vercel.app + localhost + trackyourgains.de ----
builder.Services.AddCors(opt =>
{
    var originsCsv = builder.Configuration["AllowedOrigins"] ?? "";
    var origins = originsCsv
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    opt.AddPolicy("frontend", p =>
    {
        if (origins.Length > 0)
        {
            p.WithOrigins(origins)
             .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
             .WithHeaders("Content-Type", "Authorization")
             .AllowCredentials();
        }
        else
        {
            p.SetIsOriginAllowed(origin =>
            {
                try
                {
                    var uri = new Uri(origin);
                    return uri.Host.EndsWith("vercel.app")
                           || origin.StartsWith("http://localhost")
                           || origin.StartsWith("https://localhost")
                           || uri.Host.EndsWith("trackyourgains.de")
                           || uri.Host.EndsWith("www.trackyourgains.de");
                }
                catch { return false; }
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        }
    });
});

// ---- JWT ----
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()
          ?? throw new InvalidOperationException("Missing Jwt config");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            NameClaimType = JwtRegisteredClaimNames.Sub,
            RoleClaimType = "role",
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<IJwtService, JwtService>();

// ---- Rate Limiting (global + spezielle "auth"-Policy) ----
builder.Services.AddRateLimiter(opt =>
{
    opt.RejectionStatusCode = 429;

    // Global: Token Bucket – schützt die gesamte API
    opt.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetTokenBucketLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            factory: _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 200,
                TokensPerPeriod = 200,
                ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                AutoReplenishment = true,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    // Strenger für Auth-Endpunkte → per [EnableRateLimiting("auth")] am Controller nutzen
    opt.AddPolicy("auth", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ---- Forwarded Headers (Railway Proxy) ----
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// ---- Auto-Migrate ----
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "EF migration failed at startup");
    }
}

// ---- Swagger nur Dev ----
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ---- Prod-Härtung: Security Headers + HSTS + Fehlerseite ----
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.Use(async (ctx, next) =>
    {
        // HTTPS-Erkennung hinter Proxy
        var isHttps = ctx.Request.IsHttps ||
                      string.Equals(ctx.Request.Headers["X-Forwarded-Proto"], "https", StringComparison.OrdinalIgnoreCase);

        ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
        ctx.Response.Headers["Referrer-Policy"] = "no-referrer";
        ctx.Response.Headers["X-Frame-Options"] = "DENY";
        ctx.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
        if (isHttps)
            ctx.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";

        await next();
    });

    app.UseExceptionHandler("/error");
    app.MapGet("/error", (HttpContext http) => Results.Problem());
}

// ---- Pipeline ----
app.UseRateLimiter();           // nach Headers, vor Auth
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

// ---- Debug/Infra Endpoints ----
app.MapGet("/", () => Results.Text("Gym3000 API running"));
app.MapGet("/health", () => Results.Json(new { status = "ok" }));
app.MapGet("/routes", (Microsoft.AspNetCore.Routing.EndpointDataSource eds) =>
{
    var list = eds.Endpoints.Select(e => e.DisplayName).OrderBy(x => x);
    return Results.Json(list);
});

// ---- MVC / API ----
app.MapControllers();

app.Run();
