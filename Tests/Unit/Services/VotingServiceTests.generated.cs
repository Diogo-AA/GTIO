using Backend.Contracts.Requests;
using Backend.Contracts.Responses;
using Backend.Data;
using Backend.Services;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace Backend.Tests
{
    public class VotingServiceTests
    {
        private readonly IVotoRepository _votoRepository;
        private readonly IGalaRepository _galaRepository;
        private readonly VotingService _votingService;

        public VotingServiceTests()
        {
            _votoRepository = Substitute.For<IVotoRepository>();
            _galaRepository = Substitute.For<IGalaRepository>();
            _votingService = new VotingService(_votoRepository, _galaRepository);
        }

        [Fact]
        public async Task CrearVotoAsync_DebeCrearVoto_WhenGalaAndCandidatoExistAndUserHasNotVoted()
        {
            // Arrange
            var request = new CrearVotoRequest { IdCandidato = 1, IdGala = 1 };
            var gala = new GetGalaResponse { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now, Candidatos = new List<GetGalaResponseCandidato> { new GetGalaResponseCandidato { Id = 1, Nombre = "Candidato 1", NumVotos = 0 } } };
            _galaRepository.GetByIdAsync(request.IdGala, default).Returns(gala);
            _votoRepository.IsCandidatoInGalaAsync(request.IdCandidato, request.IdGala, default).Returns(true);
            _votoRepository.HasUserVotedInGalaAsync("auth0Sub", request.IdGala, default).Returns(false);

            // Act
            var result = await _votingService.CrearVotoAsync("auth0Sub", request, default);

            // Assert
            result.Should().BeTrue();
            await _votoRepository.Received(1).CrearVotoAsync("auth0Sub", request.IdCandidato, request.IdGala, default);
        }

        [Fact]
        public async Task CrearVotoAsync_NoDebeCrearVoto_WhenGalaNoExiste()
        {
            // Arrange
            var request = new CrearVotoRequest { IdCandidato = 1, IdGala = 1 };
            _galaRepository.GetByIdAsync(request.IdGala, default).Returns((GetGalaResponse?)null);

            // Act
            var result = await _votingService.CrearVotoAsync("auth0Sub", request, default);

            // Assert
            result.Should().BeFalse();
            await _votoRepository.DidNotReceive().CrearVotoAsync("auth0Sub", request.IdCandidato, request.IdGala, default);
        }

        [Fact]
        public async Task CrearVotoAsync_NoDebeCrearVoto_WhenCandidatoNoExisteEnGala()
        {
            // Arrange
            var request = new CrearVotoRequest { IdCandidato = 1, IdGala = 1 };
            var gala = new GetGalaResponse { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now, Candidatos = new List<GetGalaResponseCandidato> { new GetGalaResponseCandidato { Id = 2, Nombre = "Candidato 2", NumVotos = 0 } } };
            _galaRepository.GetByIdAsync(request.IdGala, default).Returns(gala);
            _votoRepository.IsCandidatoInGalaAsync(request.IdCandidato, request.IdGala, default).Returns(false);

            // Act
            var result = await _votingService.CrearVotoAsync("auth0Sub", request, default);

            // Assert
            result.Should().BeFalse();
            await _votoRepository.DidNotReceive().CrearVotoAsync("auth0Sub", request.IdCandidato, request.IdGala, default);
        }

        [Fact]
        public async Task CrearVotoAsync_NoDebeCrearVoto_WhenUserHasVoted()
        {
            // Arrange
            var request = new CrearVotoRequest { IdCandidato = 1, IdGala = 1 };
            var gala = new GetGalaResponse { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now, Candidatos = new List<GetGalaResponseCandidato> { new GetGalaResponseCandidato { Id = 1, Nombre = "Candidato 1", NumVotos = 0 } } };
            _galaRepository.GetByIdAsync(request.IdGala, default).Returns(gala);
            _votoRepository.IsCandidatoInGalaAsync(request.IdCandidato, request.IdGala, default).Returns(true);
            _votoRepository.HasUserVotedInGalaAsync("auth0Sub", request.IdGala, default).Returns(true);

            // Act
            var result = await _votingService.CrearVotoAsync("auth0Sub", request, default);

            // Assert
            result.Should().BeFalse();
            await _votoRepository.DidNotReceive().CrearVotoAsync("auth0Sub", request.IdCandidato, request.IdGala, default);
        }

        [Fact]
        public async Task GetGalasAsync_DebeDevolverGalas()
        {
            // Arrange
            var galas = new List<GetGalaResponse> { new GetGalaResponse { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now, Candidatos = new List<GetGalaResponseCandidato> { new GetGalaResponseCandidato { Id = 1, Nombre = "Candidato 1", NumVotos = 0 } } } };
            _galaRepository.GetAllAsync(default).Returns(galas);

            // Act
            var result = await _votingService.GetGalasAsync(default);

            // Assert
            result.Galas.Should().BeEquivalentTo(galas);
        }

        [Fact]
        public async Task GetGalaAsync_DebeDevolverGala()
        {
            // Arrange
            var gala = new GetGalaResponse { Id = 1, Nombre = "Gala 1", Fecha = DateTime.Now, Candidatos = new List<GetGalaResponseCandidato> { new GetGalaResponseCandidato { Id = 1, Nombre = "Candidato 1", NumVotos = 0 } } };
            _galaRepository.GetByIdAsync(1, default).Returns(gala);

            // Act
            var result = await _votingService.GetGalaAsync(1, default);

            // Assert
            result.Should().BeEquivalentTo(gala);
        }

        [Fact]
        public async Task GetGalaAsync_NoDebeDevolverGala_WhenGalaNoExiste()
        {
            // Arrange
            _galaRepository.GetByIdAsync(1, default).Returns((GetGalaResponse?)null);

            // Act
            var result = await _votingService.GetGalaAsync(1, default);

            // Assert
            result.Should().BeNull();
        }
    }
}