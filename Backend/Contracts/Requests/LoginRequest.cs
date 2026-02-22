using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts.Requests;

public class LoginRequest
{
    [Required]
    [Length(3, 32)]
    public required string Username { get; init; }
    
    [Required]
    [Length(6, 128)]
    public required string Password { get; init; }
}