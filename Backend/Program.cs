using System.Text;
using Backend.Auth;
using Backend.Endpoints;
using Backend.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using MySqlConnector;
using Backend.Data;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtOptions = builder.Configuration.GetSection(nameof(JwtOptions)).Get<JwtOptions>();
        ArgumentNullException.ThrowIfNull(jwtOptions);

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = jwtOptions.ValidateIssuer,
            ValidateAudience = jwtOptions.ValidateAudience,
            ValidateLifetime = jwtOptions.ValidateLifetime,
            ValidateIssuerSigningKey = jwtOptions.ValidateIssuerSigningKey,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.TokenAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey)),
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("JwtOptions"));
builder.Services.AddScoped<JwtTokenProvider>();

builder.Services.AddCors(options =>
{
    var frontendOrigins = builder.Configuration.GetSection("Cors:Frontend").Get<string[]>() 
        ?? [builder.Configuration["Cors:Frontend"]!];
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(frontendOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "API Votación", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Autorización",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Introduce 'Bearer' seguido de un espacio y el JWT. Ejemplo: 'Bearer abc123'"
    });
});
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddValidation();

builder.Services.AddMySqlDataSource(builder.Configuration["Db:ConnString"]!);

builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IGalaRepository, GalaRepository>();
builder.Services.AddScoped<IVotoRepository, VotoRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IVotingService, VotingService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapVotingEndpoints();

app.Run();