using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Services;
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
            .Produces(StatusCodes.Status409Conflict)
            .ProducesValidationProblem()
            .AllowAnonymous()
            .WithName("Register");
    }

    public static async Task<IResult> LoginAsync([FromBody] LoginRequest request, IAuthService authService, CancellationToken cancellationToken)
    {
        var response = await authService.LoginAsync(request, cancellationToken);
        if (response is null)
            return TypedResults.NotFound();

        return TypedResults.Ok(response);
    }

    public static async Task<IResult> RegisterAsync([FromBody] RegisterRequest request, IAuthService authService, CancellationToken cancellationToken)
    {
        var response = await authService.RegisterAsync(request, cancellationToken);
        if (response is null)
            return TypedResults.Conflict();

        return TypedResults.Ok(response);
    }
}