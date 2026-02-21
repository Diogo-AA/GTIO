namespace Backend.Contracts.Responses;

public class GetGalaResponse
{
    public required int Id { get; set; }
    public required string Nombre { get; set; }
    public required DateTime Fecha { get; set; }
    public required List<GetGalaResponseCandidato> Candidatos { get; set; }
}

public class GetGalaResponseCandidato
{
    public required int Id { get; set; }
    public required string Nombre { get; set; }
    public required int NumVotos { get; set; }
}