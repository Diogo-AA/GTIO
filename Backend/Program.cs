using Amazon.XRay.Recorder.Core;
using Amazon.XRay.Recorder.Handlers.AspNetCore;
using Backend.Data;
using Backend.Endpoints;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

// X-Ray: inicializar el recorder con la configuración del proyecto
AWSXRayRecorder.InitializeInstance(configuration: builder.Configuration);

// Autenticación con Auth0
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{builder.Configuration["Auth0:Domain"]}/";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidAudience = builder.Configuration["Auth0:Audience"],
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = "https://api.ot-votacion.com/roles",
        };
    });

// Políticas de autorización
builder
    .Services.AddAuthorizationBuilder()
    .AddPolicy("Admin", policy => policy.RequireRole("admin"))
    .AddPolicy("Usuario", policy => policy.RequireRole("usuario", "admin"));

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Token JWT de Auth0",
        }
    );
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = [],
    });
});
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddValidation();

builder.Services.AddMySqlDataSource(builder.Configuration["Db:ConnString"]!);

builder.Services.AddScoped<IGalaRepository, GalaRepository>();
builder.Services.AddScoped<IVotoRepository, VotoRepository>();
builder.Services.AddScoped<IVotingService, VotingService>();

var app = builder.Build();

// X-Ray: middleware que captura cada request entrante como un segmento de traza
app.UseXRay("gtio-backend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapVotingEndpoints();

app.Logger.LogInformation("Application starting...");
app.Run();