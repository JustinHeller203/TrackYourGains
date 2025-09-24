using Gym3000.Api.Data;
using Gym3000.Api.Entities;

namespace Gym3000.Api.Services;

public interface IAuditLogger
{
    Task LogAsync(string action, string result, HttpContext http,
                  string? userId = null, string? email = null, string? detail = null);
}

public class AuditLogger(ApplicationDbContext db, ILogger<AuditLogger> log) : IAuditLogger
{
    public async Task LogAsync(string action, string result, HttpContext http,
                               string? userId = null, string? email = null, string? detail = null)
    {
        try
        {
            var entry = new AuditLog
            {
                UserId = userId,
                Email = email,
                Action = action,
                Result = result,
                Ip = http.Connection.RemoteIpAddress?.ToString(),
                UserAgent = http.Request.Headers.UserAgent.ToString(),
                Detail = detail
            };
            db.AuditLogs.Add(entry);
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "Failed to write audit log {Action}", action);
        }
    }
}
