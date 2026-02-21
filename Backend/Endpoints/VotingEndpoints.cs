using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
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
        
        app.MapGet("usuarios/{id}", GetUsuario)
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

        app.MapGet("galas/{id}", GetGala)
            .Produces<GetGalaResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesValidationProblem()
            .RequireAuthorization()
            .WithName("GetGala");
    }

    public static async Task<IResult> GetUsuarios(CancellationToken cancellationToken)
    {
        return TypedResults.Ok(new GetUsuariosResponse 
        { 
            Usuarios = []
        });
    }

    public static async Task<IResult> GetUsuario([FromRoute] string id , CancellationToken cancellationToken)
    {
        return TypedResults.Ok(new GetUsuarioResponse 
        { 
            Id = 0,
            Username = "",
            Votos = []
        });
    }

    public static async Task<IResult> CrearVoto([FromBody] CrearVotoRequest request, CancellationToken cancellationToken)
    {
        return TypedResults.Created();
    }

    public static async Task<IResult> GetGalas(CancellationToken cancellationToken)
    {
        return TypedResults.Ok(new GetGalasResponse
        {
            Galas = []
        });
    }

    public static async Task<IResult> GetGala([FromRoute] string id, CancellationToken cancellationToken)
    {
        return TypedResults.Ok(new GetGalaResponse
        {
            Id = 0,
            Nombre = "",
            Candidatos = [],
            Fecha = DateTime.Now
        });
    }
}