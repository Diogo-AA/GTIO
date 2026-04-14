using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Data;
using Backend.Services;
using FluentAssertions;
using NSubstitute;

namespace Backend.Tests.Unit.Services;

public class VotingServiceTests
{
    private readonly IVotoRepository _votoRepository;
    private readonly IGalaRepository _galaRepository;
    private readonly VotingService _sut;

    public VotingServiceTests()
    {
        _votoRepository = Substitute.For<IVotoRepository>();
        _galaRepository = Substitute.For<IGalaRepository>();
        _sut = new VotingService(_votoRepository, _galaRepository);
    }

    //CrearVotoAsync

    [Fact]
    public async Task CrearVotoAsync_TodoValido_DevuelveTrue()
    {
        // Arrange
        var auth0Sub = "auth0|abc123";
        var request = new CrearVotoRequest { IdCandidato = 1, IdGala = 1 };

        _galaRepository.GetByIdAsync(1, Arg.Any<CancellationToken>())
            .Returns(new GetGalaResponse { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now });

        _votoRepository.IsCandidatoInGalaAsync(1, 1, Arg.Any<CancellationToken>())
            .Returns(true);

        _votoRepository.HasUserVotedInGalaAsync(auth0Sub, 1, Arg.Any<CancellationToken>())
            .Returns(false);

        _votoRepository.CrearVotoAsync(auth0Sub, 1, 1, Arg.Any<CancellationToken>())
            .Returns(1);

        // Act
        var result = await _sut.CrearVotoAsync(auth0Sub, request);

        // Assert
        result.Should().BeTrue();
        await _votoRepository.Received(1).CrearVotoAsync(auth0Sub, 1, 1, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CrearVotoAsync_GalaNoExiste_DevuelveFalse()
    {
        var request = new CrearVotoRequest { IdCandidato = 1, IdGala = 99 };

        _galaRepository.GetByIdAsync(99, Arg.Any<CancellationToken>())
            .Returns((GetGalaResponse?)null);

        var result = await _sut.CrearVotoAsync("auth0|abc", request);

        result.Should().BeFalse();
        await _votoRepository.DidNotReceive().CrearVotoAsync(
            Arg.Any<string>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CrearVotoAsync_CandidatoNoEnGala_DevuelveFalse()
    {
        var request = new CrearVotoRequest { IdCandidato = 5, IdGala = 1 };

        _galaRepository.GetByIdAsync(1, Arg.Any<CancellationToken>())
            .Returns(new GetGalaResponse { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now });

        _votoRepository.IsCandidatoInGalaAsync(5, 1, Arg.Any<CancellationToken>())
            .Returns(false);

        var result = await _sut.CrearVotoAsync("auth0|abc", request);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task CrearVotoAsync_UsuarioYaVoto_DevuelveFalse()
    {
        var auth0Sub = "auth0|abc123";
        var request = new CrearVotoRequest { IdCandidato = 1, IdGala = 1 };

        _galaRepository.GetByIdAsync(1, Arg.Any<CancellationToken>())
            .Returns(new GetGalaResponse { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now });

        _votoRepository.IsCandidatoInGalaAsync(1, 1, Arg.Any<CancellationToken>())
            .Returns(true);

        _votoRepository.HasUserVotedInGalaAsync(auth0Sub, 1, Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _sut.CrearVotoAsync(auth0Sub, request);

        result.Should().BeFalse();
        await _votoRepository.DidNotReceive().CrearVotoAsync(
            Arg.Any<string>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    //GetGalasAsync

    [Fact]
    public async Task GetGalasAsync_DevuelveListaDeGalas()
    {
        var galas = new List<GetGalaResponse>
        {
            new() { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now },
            new() { Id = 2, Nombre = "Gala 2", Fecha = DateTime.Now }
        };

        _galaRepository.GetAllAsync(Arg.Any<CancellationToken>())
            .Returns(galas);

        var result = await _sut.GetGalasAsync();

        result.Galas.Should().HaveCount(2);
        result.Galas[0].Nombre.Should().Be("Gala 1");
    }

    [Fact]
    public async Task GetGalasAsync_SinGalas_DevuelveListaVacia()
    {
        _galaRepository.GetAllAsync(Arg.Any<CancellationToken>())
            .Returns(new List<GetGalaResponse>());

        var result = await _sut.GetGalasAsync();

        result.Galas.Should().BeEmpty();
    }

    //GetGalaAsync
    [Fact]
    public async Task GetGalaAsync_Existe_DevuelveGala()
    {
        var gala = new GetGalaResponse { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now };

        _galaRepository.GetByIdAsync(1, Arg.Any<CancellationToken>())
            .Returns(gala);

        var result = await _sut.GetGalaAsync(1);

        result.Should().NotBeNull();
        result!.Nombre.Should().Be("Gala 1");
    }

    [Fact]
    public async Task GetGalaAsync_NoExiste_DevuelveNull()
    {
        _galaRepository.GetByIdAsync(99, Arg.Any<CancellationToken>())
            .Returns((GetGalaResponse?)null);

        var result = await _sut.GetGalaAsync(99);

        result.Should().BeNull();
    }
}