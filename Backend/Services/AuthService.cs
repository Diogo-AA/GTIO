using Backend.Auth;
using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Data;
using Backend.Models;
using MySqlConnector;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly JwtTokenProvider _tokenProvider;

    public AuthService(IUsuarioRepository usuarioRepository, JwtTokenProvider tokenProvider)
    {
        _usuarioRepository = usuarioRepository;
        _tokenProvider = tokenProvider;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuarioRepository.GetByUsernameAsync(request.Username, cancellationToken);
        
        if (usuario is null || !PasswordHasher.VerifyHashedPassword(request.Password, usuario.Password!))
            return null;

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
