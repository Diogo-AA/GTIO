using System.Security.Claims;
using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Endpoints;

public static class VotingEndpoints
{
    public static void MapVotingEndpoints(this IEndpointRouteBuilder app)
    {
        // El usuario del voto se extrae del token
        app.MapPost("votos", CrearVoto)
            .Produces(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesValidationProblem()
            .RequireAuthorization("Usuario")
            .WithName("CrearVoto");

        // Cualquier usuario autenticado con rol puede ver galas
        app.MapGet("galas", GetGalas)
            .Produces<GetGalasResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesValidationProblem()
            .RequireAuthorization("Usuario")
            .WithName("GetGalas");

        // Cualquier usuario autenticado con rol puede ver una gala
        app.MapGet("galas/{id:int}", GetGala)
            .Produces<GetGalaResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesValidationProblem()
            .RequireAuthorization("Usuario")
            .WithName("GetGala");

        app.MapGet("votos", GetVotos)
            .Produces<GetVotosResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem()
            .RequireAuthorization()
            .WithName("GetVotos");
    }

    public static async Task<IResult> CrearVoto(
        [FromBody] CrearVotoRequest request,
        IVotingService votingService,
        ClaimsPrincipal user,
        CancellationToken cancellationToken
    )
    {
        var auth0Sub = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (auth0Sub is null)
            return TypedResults.Forbid();

        var success = await votingService.CrearVotoAsync(auth0Sub, request, cancellationToken);
        if (!success)
            return TypedResults.BadRequest();

        return TypedResults.Created();
    }

    public static async Task<IResult> GetGalas(
        IVotingService votingService,
        CancellationToken cancellationToken
    )
    {
        var response = await votingService.GetGalasAsync(cancellationToken);
        return TypedResults.Ok(response);
    }

    public static async Task<IResult> GetGala(
        [FromRoute] int id,
        IVotingService votingService,
        CancellationToken cancellationToken
    )
    {
        var response = await votingService.GetGalaAsync(id, cancellationToken);
        if (response is null)
            return TypedResults.NotFound();

        return TypedResults.Ok(response);
    }

    public static async Task<IResult> GetVotos(
        ClaimsPrincipal user,
        [FromQuery] int galaId,
        IVotingService votingService,
        CancellationToken cancellationToken
    )
    {
        var usuarioId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(usuarioId))
            return TypedResults.Unauthorized();

        var result = await votingService.GetVotosAsync(usuarioId, galaId, cancellationToken);
        return TypedResults.Ok(result);
    }
}
