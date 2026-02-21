namespace Backend.Contracts.Responses;

public class GetUsuariosResponse
{
    public required List<GetUsuarioResponse> Usuarios { get; set; }
}