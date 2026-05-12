using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace TestAgent;

internal sealed class GroqTestGenerator
{
    private const string Endpoint = "https://api.groq.com/openai/v1/chat/completions";
    private readonly HttpClient _httpClient;

    public GroqTestGenerator(string apiKey)
    {
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            apiKey
        );
    }

    public async Task<string> GenerateTestsAsync(
        string userPrompt,
        string model,
        decimal temperature
    )
    {
        var requestBody = new
        {
            model,
            temperature,
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content = """
Eres un generador de tests unitarios para proyectos .NET.

Objetivo:
- Generar únicamente código C# válido.
- No incluyas explicaciones.
- No incluyas markdown.
- No incluyas bloques ```.

Reglas:
- Usa xUnit.
- Usa NSubstitute para mocks.
- Usa FluentAssertions para aserciones.
- Usa patrón Arrange / Act / Assert.
- Los nombres de tests deben ser descriptivos en español.
- Mockea las dependencias inyectadas por constructor.
- Cubre el happy path y las ramas principales de error.
- Mantén el código simple y legible.
- No inventes tipos que no aparezcan o no se deduzcan razonablemente del código.
- Si falta contexto para algunos tipos, genera el mejor borrador posible sin comentarios explicativos.
""",
                },
                new { role = "user", content = userPrompt },
            },
        };

        var json = JsonSerializer.Serialize(requestBody);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        using var response = await _httpClient.PostAsync(Endpoint, content);
        var responseText = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Groq devolvió {(int)response.StatusCode} {response.ReasonPhrase}. Respuesta: {responseText}"
            );
        }

        using var doc = JsonDocument.Parse(responseText);

        var root = doc.RootElement;

        if (!root.TryGetProperty("choices", out var choices) || choices.GetArrayLength() == 0)
        {
            throw new InvalidOperationException("La respuesta de Groq no contiene choices.");
        }

        var message = choices[0].GetProperty("message");
        var contentNode = message.GetProperty("content");
        var generated = contentNode.GetString();

        if (string.IsNullOrWhiteSpace(generated))
        {
            throw new InvalidOperationException(
                "La respuesta de Groq no contiene contenido generado."
            );
        }

        return CleanOutput(generated);
    }

    private static string CleanOutput(string text)
    {
        var cleaned = text.Trim();

        if (cleaned.StartsWith("```csharp", StringComparison.OrdinalIgnoreCase))
        {
            cleaned = cleaned["```csharp".Length..].Trim();
        }
        else if (cleaned.StartsWith("```", StringComparison.OrdinalIgnoreCase))
        {
            cleaned = cleaned[3..].Trim();
        }

        if (cleaned.EndsWith("```", StringComparison.OrdinalIgnoreCase))
        {
            cleaned = cleaned[..^3].Trim();
        }

        return cleaned;
    }
}
