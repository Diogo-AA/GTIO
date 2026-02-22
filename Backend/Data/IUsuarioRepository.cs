using Backend.Contracts.Responses;
using Backend.Models;

namespace Backend.Data;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<int> CreateAsync(string username, string hashedPassword, CancellationToken cancellationToken = default);
    Task<List<GetUsuarioResponse>> GetAllWithVotesAsync(CancellationToken cancellationToken = default);
    Task<GetUsuarioResponse?> GetByIdWithVotesAsync(int id, CancellationToken cancellationToken = default);
}
