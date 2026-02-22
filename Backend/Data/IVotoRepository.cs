namespace Backend.Data;

public interface IVotoRepository
{
    Task<int> CrearVotoAsync(int idUsuario, int idCandidato, int idGala, CancellationToken cancellationToken = default);
    Task<bool> HasUserVotedInGalaAsync(int idUsuario, int idGala, CancellationToken cancellationToken = default);
    Task<bool> IsCandidatoInGalaAsync(int idCandidato, int idGala, CancellationToken cancellationToken = default);
}
