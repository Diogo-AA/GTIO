using Backend.Auth;
using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Data;
using Backend.Models;
using Microsoft.Extensions.Configuration;
using MySqlConnector;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly JwtTokenProvider _tokenProvider;
    private readonly IConfiguration _configuration;

    public AuthService(IUsuarioRepository usuarioRepository, JwtTokenProvider tokenProvider, IConfiguration configuration)
    {
        _usuarioRepository = usuarioRepository;
        _tokenProvider = tokenProvider;
        _configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuarioRepository.GetByUsernameAsync(request.Username, cancellationToken);
        
        if (usuario is null || !PasswordHasher.VerifyHashedPassword(request.Password, usuario.Password!))
            return null;

        var token = _tokenProvider.CreateToken(usuario);
        return new LoginResponse { AccessToken = token };
    }

    public async Task<LoginResponse> DemoLoginAsync(CancellationToken cancellationToken = default)
    {
        const string demoUsername = "demo";
        var demoPassword = _configuration["Demo:Password"] ?? "demo1234";

        var usuario = await _usuarioRepository.GetByUsernameAsync(demoUsername, cancellationToken);
        if (usuario is null)
        {
            var hashedPassword = PasswordHasher.HashPassword(demoPassword);
            var id = await _usuarioRepository.CreateAsync(demoUsername, hashedPassword, cancellationToken);
            usuario = new Models.Usuario { Id = id, Username = demoUsername };
        }

        var token = _tokenProvider.CreateToken(usuario);
        return new LoginResponse { AccessToken = token };
    }

    public async Task<RegisterResponse?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var hashedPassword = PasswordHasher.HashPassword(request.Password);
        
        try
        {
            var idUsuario = await _usuarioRepository.CreateAsync(request.Username, hashedPassword, cancellationToken);
            var usuario = new Usuario
            {
                Id = idUsuario,
                Username = request.Username
            };
            
            var token = _tokenProvider.CreateToken(usuario);
            return new RegisterResponse { AccessToken = token };
        }
        catch (MySqlException)
        {
            return null;
        }
    }
}
