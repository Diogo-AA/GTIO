namespace Backend.Data;

public interface IVotoRepository
{
    Task<int> CrearVotoAsync(
        string auth0Sub,
        int idCandidato,
        int idGala,
        CancellationToken cancellationToken = default
    );
    Task<bool> HasUserVotedInGalaAsync(
        string auth0Sub,
        int idGala,
        CancellationToken cancellationToken = default
    );
    Task<bool> IsCandidatoInGalaAsync(
        int idCandidato,
        int idGala,
        CancellationToken cancellationToken = default
    );
    Task<List<int>> GetCandidatosVotadosAsync(
        string idUsuario,
        int idGala,
        CancellationToken cancellationToken = default
    );
}
