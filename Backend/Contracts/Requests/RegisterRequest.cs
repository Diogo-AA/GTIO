using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts.Requests;

public class RegisterRequest
{
    [Required]
    [Length(6, 32)]
    public required string Username { get; init; }
    
    [Required]
    [Length(8, 128)]
    public required string Password { get; init; }
}