using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Data;

namespace Backend.Services;

public class VotingService : IVotingService
{
    private readonly IVotoRepository _votoRepository;
    private readonly IGalaRepository _galaRepository;

    public VotingService(
        IVotoRepository votoRepository,
        IGalaRepository galaRepository)
    {
        _votoRepository = votoRepository;
        _galaRepository = galaRepository;
    }

    public async Task<bool> CrearVotoAsync(string auth0Sub, CrearVotoRequest request, CancellationToken cancellationToken = default)
    {
        var gala = await _galaRepository.GetByIdAsync(request.IdGala, cancellationToken);
        if (gala is null)
            return false;

        var isCandidatoInGala = await _votoRepository.IsCandidatoInGalaAsync(request.IdCandidato, request.IdGala, cancellationToken);
        if (!isCandidatoInGala)
            return false;

        var hasVoted = await _votoRepository.HasUserVotedInGalaAsync(auth0Sub, request.IdGala, cancellationToken);
        if (hasVoted)
            return false;

        await _votoRepository.CrearVotoAsync(auth0Sub, request.IdCandidato, request.IdGala, cancellationToken);
        return true;
    }

    public async Task<GetGalasResponse> GetGalasAsync(CancellationToken cancellationToken = default)
    {
        var galas = await _galaRepository.GetAllAsync(cancellationToken);
        return new GetGalasResponse { Galas = galas };
    }

    public async Task<GetGalaResponse?> GetGalaAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _galaRepository.GetByIdAsync(id, cancellationToken);
    }
}
