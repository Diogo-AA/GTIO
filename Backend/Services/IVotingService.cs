using Backend.Contracts.Requests;
using Backend.Contracts.Responses;

namespace Backend.Services;

public interface IVotingService
{
    Task<bool> CrearVotoAsync(string auth0Sub, CrearVotoRequest request, CancellationToken cancellationToken = default);
    Task<GetGalasResponse> GetGalasAsync(CancellationToken cancellationToken = default);
    Task<GetGalaResponse?> GetGalaAsync(int id, CancellationToken cancellationToken = default);
}
