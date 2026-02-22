namespace Backend.Contracts.Responses;

public class GetUsuarioResponse
{
    public required int Id { get; init; }
    public required string Username { get; init; }
    public required List<GetUsuarioResponseVoto> Votos { get; init; }
}

public class GetUsuarioResponseVoto
{
    public required GetUsuarioResponseGala Gala { get; init; }
    public required GetUsuarioResponseCandidato Candidato { get; init; }
    public required DateTime Fecha { get; init; }
}

public class GetUsuarioResponseGala
{
    public required int Id { get; init; }
    public required string Nombre { get; init; }
}

public class GetUsuarioResponseCandidato
{
    public required int Id { get; init; }
    public required string Nombre { get; init; }
}