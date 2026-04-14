namespace Backend.Contracts.Responses;

public class GetVotosResponse
{
    public List<GetVotoResponse> Votos { get; set; } = [];
}

public class GetVotoResponse
{
    public required int CandidatoId { get; init; }
}
