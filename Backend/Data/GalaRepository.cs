using Backend.Contracts.Responses;
using Dapper;
using MySqlConnector;

namespace Backend.Data;

public class GalaRepository : IGalaRepository
{
    private readonly MySqlDataSource _dataSource;

    public GalaRepository(MySqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<List<GetGalaResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT 
                g.id AS Id,
                g.nombre AS Nombre,
                g.fecha AS Fecha,
                c.id AS Id,
                c.nombre AS Nombre,
                COUNT(v.id) AS NumVotos
            FROM gala g
            LEFT JOIN gala_candidatos gc ON gc.gala_id = g.id
            LEFT JOIN candidatos c ON c.id = gc.candidato_id
            LEFT JOIN votos v ON v.gala = g.id AND v.candidato = c.id
            GROUP BY g.id, g.nombre, g.fecha, c.id, c.nombre
            ORDER BY g.id, NumVotos DESC
        """;

        var galaDictionary = new Dictionary<int, GetGalaResponse>();

        await connection.QueryAsync<GetGalaResponse, GetGalaResponseCandidato?, GetGalaResponse>(
            sql,
            (gala, candidato) =>
            {
                if (!galaDictionary.TryGetValue(gala.Id, out var currentGala))
                {
                    currentGala = gala;
                    galaDictionary.Add(currentGala.Id, currentGala);
                }

                if (candidato != null && candidato.Id != 0)
                {
                    currentGala.Candidatos.Add(candidato);
                }

                return currentGala;
            },
            splitOn: "Id"
        );

        return galaDictionary.Values.ToList();
    }

    public async Task<GetGalaResponse?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT 
                g.id AS Id,
                g.nombre AS Nombre,
                g.fecha AS Fecha,
                c.id AS Id,
                c.nombre AS Nombre,
                COUNT(v.id) AS NumVotos
            FROM gala g
            LEFT JOIN gala_candidatos gc ON gc.gala_id = g.id
            LEFT JOIN candidatos c ON c.id = gc.candidato_id
            LEFT JOIN votos v ON v.gala = g.id AND v.candidato = c.id
            WHERE g.id = @id
            GROUP BY g.id, g.nombre, g.fecha, c.id, c.nombre
            ORDER BY NumVotos DESC
        """;

        var galaDictionary = new Dictionary<int, GetGalaResponse>();

        await connection.QueryAsync<GetGalaResponse, GetGalaResponseCandidato?, GetGalaResponse>(
            sql,
            (gala, candidato) =>
            {
                if (!galaDictionary.TryGetValue(gala.Id, out var currentGala))
                {
                    currentGala = gala;
                    galaDictionary.Add(currentGala.Id, currentGala);
                }

                if (candidato != null && candidato.Id != 0)
                {
                    currentGala.Candidatos.Add(candidato);
                }

                return currentGala;
            },
            new { id },
            splitOn: "Id"
        );

        return galaDictionary.Values.FirstOrDefault();
    }
}
