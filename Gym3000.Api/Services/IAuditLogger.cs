namespace Gym3000.Api.Services
{
	public interface IAuditLogger
	{
		Task LogAsync(string? userId, string action, object? meta = null);
	}
}
