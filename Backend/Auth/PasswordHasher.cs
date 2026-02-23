using Microsoft.AspNetCore.Identity;

namespace Backend.Auth;

public class PasswordHasher
{
    public static string HashPassword(string password)
    {
        var passwordHasher = new PasswordHasher<string>();
        return passwordHasher.HashPassword(null, password);
    }

    public static bool VerifyHashedPassword(string password, string hashedPassword)
    {
        var passwordHasher = new PasswordHasher<string>();
        return passwordHasher.VerifyHashedPassword(null, hashedPassword, password) == PasswordVerificationResult.Success;
    }
}