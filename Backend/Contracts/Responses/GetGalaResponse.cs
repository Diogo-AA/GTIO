namespace Backend.Contracts.Responses;

public class GetGalaResponse
{
    public required int Id { get; init; }
    public required string Nombre { get; init; }
    public required DateTime Fecha { get; init; }
    public List<GetGalaResponseCandidato> Candidatos { get; set; } = [];
}

public class GetGalaResponseCandidato
{
    public required int Id { get; init; }
    public required string Nombre { get; init; }
    public required int NumVotos { get; init; }
}