namespace Backend.Contracts.Responses;

public class GetGalaResponse
{
    public required int Id { get; init; }
    public required string Nombre { get; init; }
    public required DateTime Fecha { get; init; }
    public required List<GetGalaResponseCandidato> Candidatos { get; init; }
}

public class GetGalaResponseCandidato
{
    public required int Id { get; init; }
    public required string Nombre { get; init; }
    public required int NumVotos { get; init; }
}