using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Data;

namespace Backend.Services;

public class VotingService : IVotingService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IVotoRepository _votoRepository;
    private readonly IGalaRepository _galaRepository;

    public VotingService(
        IUsuarioRepository usuarioRepository, 
        IVotoRepository votoRepository, 
        IGalaRepository galaRepository)
    {
        _usuarioRepository = usuarioRepository;
        _votoRepository = votoRepository;
        _galaRepository = galaRepository;
    }

    public async Task<GetUsuariosResponse> GetUsuariosAsync(CancellationToken cancellationToken = default)
    {
        var usuarios = await _usuarioRepository.GetAllWithVotesAsync(cancellationToken);
        return new GetUsuariosResponse { Usuarios = usuarios };
    }

    public async Task<GetUsuarioResponse?> GetUsuarioAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _usuarioRepository.GetByIdWithVotesAsync(id, cancellationToken);
    }

    public async Task<bool> CrearVotoAsync(CrearVotoRequest request, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuarioRepository.GetByIdWithVotesAsync(request.IdUsuario, cancellationToken);
        if (usuario is null)
            return false;

        var gala = await _galaRepository.GetByIdAsync(request.IdGala, cancellationToken);
        if (gala is null)
            return false;

        var isCandidatoInGala = await _votoRepository.IsCandidatoInGalaAsync(request.IdCandidato, request.IdGala, cancellationToken);
        if (!isCandidatoInGala)
            return false;

        var votados = await _votoRepository.GetCandidatosVotadosAsync(request.IdUsuario, request.IdGala, cancellationToken);
        if (votados.Count > 0)
            return false;

        await _votoRepository.CrearVotoAsync(request.IdUsuario, request.IdCandidato, request.IdGala, cancellationToken);
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

    public async Task<GetVotosResponse> GetVotosAsync(int usuarioId, int galaId, CancellationToken cancellationToken = default)
    {
        var candidatos = await _votoRepository.GetCandidatosVotadosAsync(usuarioId, galaId, cancellationToken);
        return new GetVotosResponse
        {
            Votos = candidatos.Select(c => new GetVotoResponse { CandidatoId = c }).ToList()
        };
    }
}
