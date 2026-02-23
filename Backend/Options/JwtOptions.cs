namespace Backend.Options;

public class JwtOptions
{
    public required string SecretKey { get; init; }

    public required bool ValidateIssuer { get; init; }

    public required bool ValidateAudience { get; init; }

    public required bool ValidateLifetime { get; init; }

    public required bool ValidateIssuerSigningKey { get; init; }

    public required string Issuer { get; init; }

    public required string TokenAudience { get; init; }

    public required int TokenExpirationInMinutes { get; init; }
}