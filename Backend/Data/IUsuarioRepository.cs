using Backend.Contracts.Responses;

namespace Backend.Data;

public interface IUsuarioRepository
{
    Task<List<GetUsuarioResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<GetUsuarioDetalleResponse?> GetByIdentifierAsync(
        string identifier,
        CancellationToken cancellationToken = default
    );
}
