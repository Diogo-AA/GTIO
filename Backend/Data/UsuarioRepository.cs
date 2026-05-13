using Backend.Contracts.Responses;
using Dapper;
using MySqlConnector;

namespace Backend.Data;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly MySqlDataSource _dataSource;

    public UsuarioRepository(MySqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<List<GetUsuarioResponse>> GetAllAsync(
        CancellationToken cancellationToken = default
    )
    {
        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

        const string sql = """
                WITH usuarios AS (
                    SELECT
                        ROW_NUMBER() OVER (ORDER BY usuario) AS Id,
                        usuario AS Auth0Sub
                    FROM (SELECT DISTINCT usuario FROM votos) u
                )
                SELECT
                    Id,
                    Auth0Sub AS Username
                FROM usuarios
                ORDER BY Id;
            """;

        var usuarios = await connection.QueryAsync<GetUsuarioResponse>(sql);
        return usuarios.ToList();
    }

    public async Task<GetUsuarioDetalleResponse?> GetByIdentifierAsync(
        string identifier,
        CancellationToken cancellationToken = default
    )
    {
        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

        const string userSql = """
                WITH usuarios AS (
                    SELECT
                        ROW_NUMBER() OVER (ORDER BY usuario) AS Id,
                        usuario AS Auth0Sub
                    FROM (SELECT DISTINCT usuario FROM votos) u
                )
                SELECT
                    Id,
                    Auth0Sub
                FROM usuarios
                WHERE CAST(Id AS CHAR) = @identifier OR Auth0Sub = @identifier
                LIMIT 1;
            """;

        var usuario = await connection.QuerySingleOrDefaultAsync<UsuarioDbRow>(
            userSql,
            new { identifier }
        );

        var auth0Sub = usuario?.Auth0Sub ?? identifier;
        var id = usuario?.Id ?? 0;

        const string votosSql = """
                SELECT
                    g.id AS GalaId,
                    g.nombre AS GalaNombre,
                    c.id AS CandidatoId,
                    c.nombre AS CandidatoNombre,
                    v.fecha AS Fecha
                FROM votos v
                INNER JOIN gala g ON g.id = v.gala
                INNER JOIN candidatos c ON c.id = v.candidato
                WHERE v.usuario = @auth0Sub
                ORDER BY v.fecha DESC;
            """;

        var votos = await connection.QueryAsync<VotoDbRow>(votosSql, new { auth0Sub });

        return new GetUsuarioDetalleResponse
        {
            Id = id,
            Username = auth0Sub,
            Votos = votos
                .Select(voto => new GetUsuarioVotoResponse
                {
                    Gala = new GetUsuarioVotoGalaResponse
                    {
                        Id = voto.GalaId,
                        Nombre = voto.GalaNombre,
                    },
                    Candidato = new GetUsuarioVotoCandidatoResponse
                    {
                        Id = voto.CandidatoId,
                        Nombre = voto.CandidatoNombre,
                    },
                    Fecha = voto.Fecha,
                })
                .ToList(),
        };
    }

    private sealed class UsuarioDbRow
    {
        public int Id { get; init; }
        public required string Auth0Sub { get; init; }
    }

    private sealed class VotoDbRow
    {
        public int GalaId { get; init; }
        public required string GalaNombre { get; init; }
        public int CandidatoId { get; init; }
        public required string CandidatoNombre { get; init; }
        public DateTime Fecha { get; init; }
    }
}
