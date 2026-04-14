# TestAgent

Herramienta de línea de comandos para generar borradores de tests unitarios en C# usando Groq.

## Requisitos

- .NET 10 SDK
- Variable de entorno `GROQ_API_KEY`

## Configuración de la API key

### PowerShell (sesión actual)
```powershell
$env:GROQ_API_KEY="tu_api_key"

### ejemplo de ejecución

dotnet run --project Tools/TestAgent -- Backend/Services/VotingService.cs --output Tests/Unit/Services/VotingServiceTests.generated.cs

dotnet test Tests/Tests.csproj 