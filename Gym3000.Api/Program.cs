var builder = WebApplication.CreateBuilder(args);

// NICHTS registrieren – keine DB, kein CORS, nichts.

var app = builder.Build();

// zwei triviale Endpoints
app.MapGet("/", () => Results.Text("ok root"));
app.MapGet("/health", () => Results.Json(new { status = "ok" }));

app.Run();
