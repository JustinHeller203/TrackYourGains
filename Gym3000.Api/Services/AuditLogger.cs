using Gym3000.Api.Data;
using Gym3000.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Gym3000.Api.Services
{
    public class AuditLogger : IAuditLogger
    {
        private readonly ApplicationDbContext _db;

        public AuditLogger(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task LogAsync(string? userId, string action, object? meta = null)
        {
            try
            {
                var log = new AuditLog
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Action = action,
                    CreatedUtc = DateTime.UtcNow,
                    Ip = "system", // falls kein HttpContext da
                    UserAgent = "system",
                    Meta = meta is null ? null : JsonSerializer.Serialize(meta)
                };

                _db.AuditLogs.Add(log);
                await _db.SaveChangesAsync();
            }
            catch
            {
                // Logging darf nie Exceptions nach auﬂen werfen
            }
        }
    }
}
