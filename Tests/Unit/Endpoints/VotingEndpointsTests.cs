using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Endpoints;
using Backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http.HttpResults;
using NSubstitute;
using System.Security.Claims;

namespace Tests.Unit.Endpoints;

public class VotingEndpointsTests
{
    private readonly IVotingService _votingService;

    public VotingEndpointsTests()
    {
        _votingService = Substitute.For<IVotingService>();
    }

    private static ClaimsPrincipal CreateUser(string sub = "auth0|test123")
    {
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, sub) };
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "test"));
    }

    // --- CrearVoto ---

    [Fact]
    public async Task CrearVoto_VotoValido_DevuelveCreated()
    {
        var request = new CrearVotoRequest { IdCandidato = 1, IdGala = 1 };
        var user = CreateUser();

        _votingService.CrearVotoAsync("auth0|test123", request, Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await VotingEndpoints.CrearVoto(request, _votingService, user, CancellationToken.None);

        result.Should().BeOfType<Created>();
    }

    [Fact]
    public async Task CrearVoto_VotoInvalido_DevuelveBadRequest()
    {
        var request = new CrearVotoRequest { IdCandidato = 1, IdGala = 1 };
        var user = CreateUser();

        _votingService.CrearVotoAsync("auth0|test123", request, Arg.Any<CancellationToken>())
            .Returns(false);

        var result = await VotingEndpoints.CrearVoto(request, _votingService, user, CancellationToken.None);

        result.Should().BeOfType<BadRequest>();
    }

    [Fact]
    public async Task CrearVoto_SinSubEnToken_DevuelveForbid()
    {
        var request = new CrearVotoRequest { IdCandidato = 1, IdGala = 1 };
        var user = new ClaimsPrincipal(new ClaimsIdentity());

        var result = await VotingEndpoints.CrearVoto(request, _votingService, user, CancellationToken.None);

        result.Should().BeOfType<ForbidHttpResult>();
    }

    // --- GetGalas ---

    [Fact]
    public async Task GetGalas_DevuelveOkConGalas()
    {
        var response = new GetGalasResponse
        {
            Galas = [new GetGalaResponse { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now }]
        };

        _votingService.GetGalasAsync(Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await VotingEndpoints.GetGalas(_votingService, CancellationToken.None);

        var okResult = result.Should().BeOfType<Ok<GetGalasResponse>>().Subject;
        okResult.Value!.Galas.Should().HaveCount(1);
    }

    // --- GetGala ---

    [Fact]
    public async Task GetGala_Existe_DevuelveOk()
    {
        var gala = new GetGalaResponse { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now };

        _votingService.GetGalaAsync(1, Arg.Any<CancellationToken>())
            .Returns(gala);

        var result = await VotingEndpoints.GetGala(1, _votingService, CancellationToken.None);

        var okResult = result.Should().BeOfType<Ok<GetGalaResponse>>().Subject;
        okResult.Value!.Nombre.Should().Be("Gala 1");
    }

    [Fact]
    public async Task GetGala_NoExiste_DevuelveNotFound()
    {
        _votingService.GetGalaAsync(99, Arg.Any<CancellationToken>())
            .Returns((GetGalaResponse?)null);

        var result = await VotingEndpoints.GetGala(99, _votingService, CancellationToken.None);

        result.Should().BeOfType<NotFound>();
    }
}