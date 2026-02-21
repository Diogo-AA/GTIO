using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts.Requests;

public class CrearVotoRequest
{
    [Required]
    public required int IdUsuario { get; set; }

    [Required]
    public required int IdCandidato { get; set; }

    [Required]
    public required int IdGala { get; set; }
}