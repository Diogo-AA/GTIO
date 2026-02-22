using Backend.Contracts.Requests;
using Backend.Contracts.Responses;

namespace Backend.Services;

public interface IVotingService
{
    Task<GetUsuariosResponse> GetUsuariosAsync(CancellationToken cancellationToken = default);
    Task<GetUsuarioResponse?> GetUsuarioAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> CrearVotoAsync(CrearVotoRequest request, CancellationToken cancellationToken = default);
    Task<GetGalasResponse> GetGalasAsync(CancellationToken cancellationToken = default);
    Task<GetGalaResponse?> GetGalaAsync(int id, CancellationToken cancellationToken = default);
}
