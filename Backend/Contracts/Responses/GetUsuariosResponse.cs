namespace Backend.Contracts.Responses;

public class GetUsuariosResponse
{
    public List<GetUsuarioResponse> Usuarios { get; set; } = [];
}

public class GetUsuarioResponse
{
    public required int Id { get; init; }
    public required string Username { get; init; }
}

public class GetUsuarioDetalleResponse
{
    public required int Id { get; init; }
    public required string Username { get; init; }
    public List<GetUsuarioVotoResponse> Votos { get; set; } = [];
}

public class GetUsuarioVotoResponse
{
    public required GetUsuarioVotoGalaResponse Gala { get; init; }
    public required GetUsuarioVotoCandidatoResponse Candidato { get; init; }
    public required DateTime Fecha { get; init; }
}

public class GetUsuarioVotoGalaResponse
{
    public required int Id { get; init; }
    public required string Nombre { get; init; }
}

public class GetUsuarioVotoCandidatoResponse
{
    public required int Id { get; init; }
    public required string Nombre { get; init; }
}
