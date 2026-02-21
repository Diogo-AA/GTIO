namespace Backend.Contracts.Responses;

public class GetUsuarioResponse
{
    public required int Id { get; set; }
    public required string Username { get; set; }
    public required List<GetUsuarioResponseVoto> Votos { get; set; }
}

public class GetUsuarioResponseVoto
{
    public required GetUsuarioResponseGala Gala { get; set; }
    public required GetUsuarioResponseCandidato Candidato { get; set; }
    public required DateTime Fecha { get; set; }
}

public class GetUsuarioResponseGala
{
    public required int Id { get; set; }
    public required string Nombre { get; set; }
}

public class GetUsuarioResponseCandidato
{
    public required int Id { get; set; }
    public required string Nombre { get; set; }
}