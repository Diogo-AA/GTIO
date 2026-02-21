using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        app = app.MapGroup("auth/");

        app.MapPost("login", LoginAsync)
            .Produces<LoginResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .AllowAnonymous()
            .WithName("Login");

        app.MapPost("register", RegisterAsync)
            .Produces<RegisterResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .AllowAnonymous()
            .WithName("Register");
    }

    public static async Task<IResult> LoginAsync([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        return TypedResults.Ok(new LoginResponse { AccessToken = "" });
    }

    public static async Task<IResult> RegisterAsync([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        return TypedResults.Ok(new RegisterResponse { AccessToken = "" });
    }
}