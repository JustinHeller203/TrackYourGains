using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Security.Claims;
using Gym3000.Api.Data;
using Gym3000.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ---- DB (Railway: DATABASE_URL normalisieren) ----
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

// --- Helper: URL -> Npgsql ConnectionString ---
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

// ---- Identity ----
builder.Services
    .AddIdentityCore<IdentityUser>(opt =>
    {
        opt.User.RequireUniqueEmail = true;
        opt.Password.RequiredLength = 8;
        opt.Password.RequireDigit = true;
        opt.Password.RequireUppercase = true;
        opt.Password.RequireLowercase = true;
        opt.Password.RequireNonAlphanumeric = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>();

// ---- CORS (SAFE MODE: alles erlauben, inkl. Credentials) ----
// Wichtig: SetIsOriginAllowed(_ => true) + AllowCredentials()
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p =>
        p.SetIsOriginAllowed(_ => true)
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials());
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

// ---- Pipeline (MINIMAL) ----
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

// ---- Liveness ----
app.MapGet("/", () => Results.Text("Gym3000 API running"));
app.MapGet("/health", () => Results.Json(new { status = "ok" }));

// ---- Controllers ----
app.MapControllers();

app.Run();
