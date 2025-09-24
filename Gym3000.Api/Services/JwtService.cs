// src/Services/JwtService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Gym3000.Api.Services;

public class JwtOptions
{
    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;
    public string Key { get; set; } = default!;
    public int ExpiresMinutes { get; set; } = 60;
}

public interface IJwtService
{
    // <- NEU: tokenVersion als dritter Parameter
    string Create(string userId, string email, int tokenVersion);
}

public class JwtService : IJwtService
{
    private readonly JwtOptions _o;
    public JwtService(IOptions<JwtOptions> opt) => _o = opt.Value;

    public string Create(string userId, string email, int tokenVersion)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Email, email),

            // wichtige Versionierung fürs Invalidieren alter Tokens
            new Claim("tv", tokenVersion.ToString()),

            // optional aber nützlich: eindeutige Token-ID
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_o.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _o.Issuer,
            audience: _o.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_o.ExpiresMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
