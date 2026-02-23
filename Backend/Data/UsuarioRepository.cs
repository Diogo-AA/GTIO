using Backend.Contracts.Responses;
using Backend.Models;
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

    public async Task<Usuario?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

        const string sql = """
        SELECT id, nombre AS username, passwd AS password
        FROM usuarios
        WHERE nombre = @username;
        """;

        return await connection.QuerySingleOrDefaultAsync<Usuario>(sql, new { username });
    }

    public async Task<int> CreateAsync(string username, string hashedPassword, CancellationToken cancellationToken = default)
    {
        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

        const string sql = """
        INSERT INTO usuarios (nombre, passwd) VALUES (@username, @hashedPassword);
        SELECT LAST_INSERT_ID();
        """;

        return await connection.ExecuteScalarAsync<int>(sql, new { username, hashedPassword });
    }

    public async Task<List<GetUsuarioResponse>> GetAllWithVotesAsync(CancellationToken cancellationToken = default)
    {
        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

        const string sql = """
        SELECT 
            u.id AS Id,
            u.nombre AS Username,
            v.fecha AS Fecha,
            g.id AS Id,
            g.nombre As Nombre,
            c.id AS Id,
            c.nombre AS Nombre
        FROM usuarios u
        LEFT JOIN votos v ON u.id = v.usuario
        LEFT JOIN gala g ON g.id = v.gala
        LEFT JOIN candidatos c ON c.id = v.candidato
        """;

        var userDictionary = new Dictionary<int, GetUsuarioResponse>();

        await connection.QueryAsync<
            GetUsuarioResponse, 
            GetUsuarioResponseVoto?, 
            GetUsuarioResponseGala?, 
            GetUsuarioResponseCandidato?, 
            GetUsuarioResponse>(
            sql,
            (usuario, voto, gala, candidato) =>
            {
                if (!userDictionary.TryGetValue(usuario.Id, out var currentUsuario))
                {
                    currentUsuario = usuario;
                    userDictionary.Add(currentUsuario.Id, currentUsuario);
                }

                if (voto != null && gala != null && candidato != null)
                {
                    var votoCompleto = new GetUsuarioResponseVoto
                    {
                        Fecha = voto.Fecha,
                        Gala = gala,
                        Candidato = candidato
                    };
                    currentUsuario.Votos.Add(votoCompleto);
                }

                return currentUsuario; 
            },
            splitOn: "Fecha,Id,Id" 
        );

        return userDictionary.Values.ToList();
    }

    public async Task<GetUsuarioResponse?> GetByIdWithVotesAsync(int id, CancellationToken cancellationToken = default)
    {
        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

        const string sql = """
        SELECT 
            u.id AS Id,
            u.nombre AS Username,
            v.fecha AS Fecha,
            g.id AS Id,
            g.nombre As Nombre,
            c.id AS Id,
            c.nombre AS Nombre
        FROM usuarios u
        LEFT JOIN votos v ON u.id = v.usuario
        LEFT JOIN gala g ON g.id = v.gala
        LEFT JOIN candidatos c ON c.id = v.candidato
        WHERE u.id = @id
        """;

        var userDictionary = new Dictionary<int, GetUsuarioResponse>();

        await connection.QueryAsync<
            GetUsuarioResponse, 
            GetUsuarioResponseVoto?, 
            GetUsuarioResponseGala?, 
            GetUsuarioResponseCandidato?, 
            GetUsuarioResponse>(
            sql,
            (usuario, voto, gala, candidato) =>
            {
                if (!userDictionary.TryGetValue(usuario.Id, out var currentUsuario))
                {
                    currentUsuario = usuario;
                    userDictionary.Add(currentUsuario.Id, currentUsuario);
                }

                if (voto != null && gala != null && candidato != null)
                {
                    var votoCompleto = new GetUsuarioResponseVoto
                    {
                        Fecha = voto.Fecha,
                        Gala = gala,
                        Candidato = candidato
                    };
                    currentUsuario.Votos.Add(votoCompleto);
                }

                return currentUsuario; 
            },
            new { id },
            splitOn: "Fecha,Id,Id" 
        );

        return userDictionary.Values.FirstOrDefault();
    }
}
