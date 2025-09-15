using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Gym3000.Api.Services;

public class JwtOptions
{
    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;
    public string Key { get; set; } = default!;
    public int ExpiresMinutes { get; set; } = 60; // optional
}

public interface IJwtService
{
    string Create(string userId, string email);
}

public class JwtService : IJwtService
{
    private readonly JwtOptions _o;

    public JwtService(IOptions<JwtOptions> opt) => _o = opt.Value;

    public string Create(string userId, string email)
    {
        var claims = new[]
        {
            // "sub" = Subject → mappen wir in Program.cs auf NameIdentifier
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
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
