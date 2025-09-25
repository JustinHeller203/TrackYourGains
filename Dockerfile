# --- Build-Stage ---
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore Gym3000.Api/Gym3000.Api.csproj
RUN dotnet publish Gym3000.Api/Gym3000.Api.csproj -c Release -o /out

# --- Runtime-Stage ---
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Railway gibt $PORT automatisch vor
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}

COPY --from=build /out .

# Nur einmal starten → keine doppelten ENV
ENTRYPOINT ["dotnet", "Gym3000.Api.dll"]
