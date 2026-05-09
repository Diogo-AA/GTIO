using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Data;

namespace Backend.Services;

public class VotingService : IVotingService
{
    private readonly IVotoRepository _votoRepository;
    private readonly IGalaRepository _galaRepository;
    private readonly ILogger<VotingService> _logger;

    public VotingService(
        IVotoRepository votoRepository,
        IGalaRepository galaRepository,
        ILogger<VotingService> logger
    )
    {
        _votoRepository = votoRepository;
        _galaRepository = galaRepository;
        _logger = logger;
    }

    public async Task<bool> CrearVotoAsync(
        string auth0Sub,
        CrearVotoRequest request,
        CancellationToken cancellationToken = default
    )
    {
        _logger.LogInformation(
            "Attempting to create vote for user {User} in gala {Gala} for candidate {Candidate}",
            auth0Sub,
            request.IdGala,
            request.IdCandidato
        );

        var gala = await _galaRepository.GetByIdAsync(request.IdGala, cancellationToken);
        if (gala is null)
        {
            _logger.LogWarning("Failed to create vote: Gala {Gala} not found", request.IdGala);
            return false;
        }

        var isCandidatoInGala = await _votoRepository.IsCandidatoInGalaAsync(
            request.IdCandidato,
            request.IdGala,
            cancellationToken
        );
        if (!isCandidatoInGala)
        {
            _logger.LogWarning(
                "Failed to create vote: Candidate {Candidate} is not in gala {Gala}",
                request.IdCandidato,
                request.IdGala
            );
            return false;
        }

        var hasVoted = await _votoRepository.HasUserVotedInGalaAsync(
            auth0Sub,
            request.IdGala,
            cancellationToken
        );
        if (hasVoted)
        {
            _logger.LogWarning(
                "Failed to create vote: User {User} has already voted in gala {Gala}",
                auth0Sub,
                request.IdGala
            );
            return false;
        }

        await _votoRepository.CrearVotoAsync(
            auth0Sub,
            request.IdCandidato,
            request.IdGala,
            cancellationToken
        );
        _logger.LogInformation(
            "Vote successfully created for user {User} in gala {Gala} for candidate {Candidate}",
            auth0Sub,
            request.IdGala,
            request.IdCandidato
        );
        return true;
    }

    public async Task<GetGalasResponse> GetGalasAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching all galas");
        var galas = await _galaRepository.GetAllAsync(cancellationToken);
        return new GetGalasResponse { Galas = galas };
    }

    public async Task<GetGalaResponse?> GetGalaAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        _logger.LogInformation("Fetching gala with ID {Gala}", id);
        var gala = await _galaRepository.GetByIdAsync(id, cancellationToken);
        if (gala is null)
        {
            _logger.LogWarning("Gala {Gala} not found", id);
        }
        return gala;
    }
}
