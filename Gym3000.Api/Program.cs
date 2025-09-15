using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
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

// ---- Identity (cookie-less) ----
builder.Services
    .AddIdentityCore<IdentityUser>(opt => { opt.User.RequireUniqueEmail = true; })
    .AddEntityFrameworkStores<ApplicationDbContext>();

// ---- CORS: localhost + *.vercel.app + deine Domain ----
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p => p
        .SetIsOriginAllowed(origin =>
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
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<IJwtService, JwtService>();

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
        // Wenn du willst: App trotzdem starten lassen
    }
}

// ---- Swagger nur Dev ----
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

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
