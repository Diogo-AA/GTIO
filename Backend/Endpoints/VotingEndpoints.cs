using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Endpoints;

public static class VotingEndpoints
{
    public static void MapVotingEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("usuarios", GetUsuarios)
            .Produces<GetUsuariosResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesValidationProblem()
            .RequireAuthorization()
            .WithName("GetUsuarios");
        
        app.MapGet("usuarios/{id:int}", GetUsuario)
            .Produces<GetUsuarioResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesValidationProblem()
            .RequireAuthorization()
            .WithName("GetUsuario");

        app.MapPost("votos", CrearVoto)
            .Produces(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem()
            .RequireAuthorization()
            .WithName("CrearVoto");

        app.MapGet("galas", GetGalas)
            .Produces<GetGalasResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesValidationProblem()
            .RequireAuthorization()
            .WithName("GetGalas");

        app.MapGet("galas/{id:int}", GetGala)
            .Produces<GetGalaResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesValidationProblem()
            .RequireAuthorization()
            .WithName("GetGala");
    }

    public static async Task<IResult> GetUsuarios(IVotingService votingService, CancellationToken cancellationToken)
    {
        var response = await votingService.GetUsuariosAsync(cancellationToken);
        return TypedResults.Ok(response);
    }

    public static async Task<IResult> GetUsuario([FromRoute] int id, IVotingService votingService, CancellationToken cancellationToken)
    {
        var response = await votingService.GetUsuarioAsync(id, cancellationToken);
        if (response is null)
            return TypedResults.NotFound();

        return TypedResults.Ok(response);
    }

    public static async Task<IResult> CrearVoto([FromBody] CrearVotoRequest request, IVotingService votingService, CancellationToken cancellationToken)
    {
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