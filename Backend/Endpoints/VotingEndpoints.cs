using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Endpoints;

public static class VotingEndpoints
{
    public static void MapVotingEndpoints(this IEndpointRouteBuilder app)
    {
        // Solo admin puede ver todos los usuarios
        app.MapGet("usuarios", GetUsuarios)
            .Produces<GetUsuariosResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesValidationProblem()
            .RequireAuthorization("Admin")
            .WithName("GetUsuarios");

        // Admin puede ver cualquier usuario, un usuario solo puede verse a sí mismo
        app.MapGet("usuarios/{id:int}", GetUsuario)
            .Produces<GetUsuarioResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesValidationProblem()
            .RequireAuthorization("Usuario")
            .WithName("GetUsuario");

        // Cualquier usuario autenticado con rol puede votar (solo por sí mismo)
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
    }

    public static async Task<IResult> GetUsuarios(IVotingService votingService, CancellationToken cancellationToken)
    {
        var response = await votingService.GetUsuariosAsync(cancellationToken);
        return TypedResults.Ok(response);
    }

    public static async Task<IResult> GetUsuario([FromRoute] int id, IVotingService votingService, ClaimsPrincipal user, CancellationToken cancellationToken)
    {
        // Si no es admin, solo puede ver su propio perfil
        var isAdmin = user.IsInRole("admin");
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!isAdmin && userIdClaim != id.ToString())
            return TypedResults.Forbid();

        var response = await votingService.GetUsuarioAsync(id, cancellationToken);
        if (response is null)
            return TypedResults.NotFound();

        return TypedResults.Ok(response);
    }

    public static async Task<IResult> CrearVoto([FromBody] CrearVotoRequest request, IVotingService votingService, ClaimsPrincipal user, CancellationToken cancellationToken)
    {
        // Un usuario solo puede votar por sí mismo
        var isAdmin = user.IsInRole("admin");
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!isAdmin && userIdClaim != request.IdUsuario.ToString())
            return TypedResults.Forbid();

        var success = await votingService.CrearVotoAsync(request, cancellationToken);
        if (!success)
            return TypedResults.BadRequest();

        return TypedResults.Created();
    }

    public static async Task<IResult> GetGalas(IVotingService votingService, CancellationToken cancellationToken)
    {
        var response = await votingService.GetGalasAsync(cancellationToken);
        return TypedResults.Ok(response);
    }

    public static async Task<IResult> GetGala([FromRoute] int id, IVotingService votingService, CancellationToken cancellationToken)
    {
        var response = await votingService.GetGalaAsync(id, cancellationToken);
        if (response is null)
            return TypedResults.NotFound();

        return TypedResults.Ok(response);
    }
}