using Backend.Contracts.Requests;
using Backend.Contracts.Responses;

namespace Backend.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<RegisterResponse?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
}
