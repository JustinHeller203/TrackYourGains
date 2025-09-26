using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.RateLimiting;
using System.Security.Claims;

using Gym3000.Api.Data;
using Gym3000.Api.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ======================================================================
// DB (Railway: DATABASE_URL normalisieren)
// ======================================================================
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

// Helper: URL -> Npgsql ConnectionString
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

// ======================================================================
// Identity (stärkere Policies)
// ======================================================================
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

// ======================================================================
// CORS – robustes Einlesen aus AllowedOrigins (CSV mit vollständigen Origins)
// Beispiele: https://trackyourgains.de, https://www.trackyourgains.de, https://deine-app.vercel.app
// ======================================================================
string originsCsv = builder.Configuration["AllowedOrigins"] ?? "";
var parsed = originsCsv
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Where(o => o.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || o.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
    .Select(o => o.Trim())
    .Where(o => Uri.TryCreate(o, UriKind.Absolute, out var u) && (u.Scheme == Uri.UriSchemeHttp || u.Scheme == Uri.UriSchemeHttps))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p =>
    {
        if (parsed.Length > 0)
        {
            // Nur gültige, normalisierte Origins verwenden – vermeidet UriFormatException
            p.WithOrigins(parsed)
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials();
        }
        else
        {
            // Fallback: Host-Match (vermeidet harte Abbrüche bei leerer Variable)
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

// ======================================================================
// JWT (inkl. Token-Versionierung "tv" Prüfung)
// ======================================================================
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

        o.Events = new JwtBearerEvents
        {
            OnTokenValidated = async ctx =>
            {
                var userId = ctx.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                var tvClaim = ctx.Principal?.FindFirst("tv")?.Value;

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(tvClaim))
                {
                    ctx.Fail("invalid token claims");
                    return;
                }

                var db = ctx.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
                var meta = await db.UserMetas.FindAsync(userId);
                var currentTv = meta?.TokenVersion ?? 0;

                if (tvClaim != currentTv.ToString())
                {
                    ctx.Fail("stale token");
                }
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();

// ======================================================================
// Rate Limiting
// ======================================================================
builder.Services.AddRateLimiter(opt =>
{
    opt.RejectionStatusCode = 429;

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

// ======================================================================
// Forwarded Headers (Railway Proxy)
// ======================================================================
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// ======================================================================
// Auto-Migrate
// ======================================================================
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

// ======================================================================
// Swagger (nur Dev)
// ======================================================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ======================================================================
// Security Headers / HSTS
// ======================================================================
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.Use(async (ctx, next) =>
    {
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

// ======================================================================
// CORS muss VOR allem, was Antworten erzeugt (inkl. Custom-Middleware)
// ======================================================================
app.UseRateLimiter();
app.UseCors("frontend");

// ======================================================================
// CSRF-Guard NUR für refresh/logout, tolerant falls AllowedOrigins leer
// ======================================================================
var allowedOriginSet = new HashSet<string>(parsed, StringComparer.OrdinalIgnoreCase);

static bool IsOriginAllowed(HashSet<string> allowed, string? candidate)
{
    if (string.IsNullOrWhiteSpace(candidate)) return false;
    if (!Uri.TryCreate(candidate, UriKind.Absolute, out var u)) return false;
    var normalized = $"{u.Scheme}://{u.Host}{(u.IsDefaultPort ? "" : $":{u.Port}")}";
    return allowed.Contains(normalized);
}

app.Use(async (ctx, next) =>
{
    // Nur schützen, wenn wir eine Whitelist haben
    if (allowedOriginSet.Count > 0 &&
        HttpMethods.IsPost(ctx.Request.Method) &&
        ctx.Request.Path.StartsWithSegments("/api/auth", out var rest) &&
        (rest.StartsWithSegments("/refresh") || rest.StartsWithSegments("/logout")))
    {
        var origin = ctx.Request.Headers["Origin"].ToString();
        var referer = ctx.Request.Headers["Referer"].ToString();
        var toCheck = !string.IsNullOrEmpty(origin) ? origin : referer;

        if (!IsOriginAllowed(allowedOriginSet, toCheck))
        {
            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
            await ctx.Response.WriteAsJsonAsync(new { message = "Forbidden origin" });
            return;
        }
    }

    await next();
});

app.UseAuthentication();
app.UseAuthorization();

// ======================================================================
// Health & Debug
// ======================================================================
app.MapGet("/", () => Results.Text("Gym3000 API running"));
app.MapGet("/health", () => Results.Json(new { status = "ok" }));
app.MapGet("/routes", (Microsoft.AspNetCore.Routing.EndpointDataSource eds) =>
{
    var list = eds.Endpoints.Select(e => e.DisplayName).OrderBy(x => x);
    return Results.Json(list);
});

// --- TEMP: POST-Probe (nur Debug) ---
app.MapPost("/__probe", () => Results.Ok(new { ok = true, ts = DateTime.UtcNow }));

// ======================================================================
// Controllers
// ======================================================================
app.MapControllers();

app.Run();
