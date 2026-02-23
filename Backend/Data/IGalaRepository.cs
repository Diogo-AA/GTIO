using Backend.Contracts.Responses;

namespace Backend.Data;

public interface IGalaRepository
{
    Task<List<GetGalaResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<GetGalaResponse?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}
