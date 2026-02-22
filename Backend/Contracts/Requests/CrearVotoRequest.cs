using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts.Requests;

public class CrearVotoRequest
{
    [Required]
    public required int IdUsuario { get; init; }

    [Required]
    public required int IdCandidato { get; init; }

    [Required]
    public required int IdGala { get; init; }
}