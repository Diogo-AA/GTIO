using Dapper;
using MySqlConnector;

namespace Backend.Data;

public class VotoRepository : IVotoRepository
{
    private readonly MySqlDataSource _dataSource;

    public VotoRepository(MySqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<int> CrearVotoAsync(
        string auth0Sub,
        int idCandidato,
        int idGala,
        CancellationToken cancellationToken = default
    )
    {
        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

        const string sql = """
                INSERT INTO votos (fecha, usuario, candidato, gala)
                VALUES (@fecha, @auth0Sub, @idCandidato, @idGala);
                SELECT LAST_INSERT_ID();
            """;

        return await connection.ExecuteScalarAsync<int>(
            sql,
            new
            {
                fecha = DateTime.Now,
                auth0Sub,
                idCandidato,
                idGala,
            }
        );
    }

    public async Task<bool> HasUserVotedInGalaAsync(
        string auth0Sub,
        int idGala,
        CancellationToken cancellationToken = default
    )
    {
        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

        const string sql = """
                SELECT COUNT(1)
                FROM votos
                WHERE usuario = @auth0Sub AND gala = @idGala;
            """;

        var count = await connection.ExecuteScalarAsync<int>(sql, new { auth0Sub, idGala });
        return count > 0;
    }

    public async Task<bool> IsCandidatoInGalaAsync(
        int idCandidato,
        int idGala,
        CancellationToken cancellationToken = default
    )
    {
        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

        const string sql = """
                SELECT COUNT(1)
                FROM gala_candidatos
                WHERE candidato_id = @idCandidato AND gala_id = @idGala;
            """;

        var count = await connection.ExecuteScalarAsync<int>(sql, new { idCandidato, idGala });
        return count > 0;
    }
}
