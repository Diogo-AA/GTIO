namespace TestAgent;

internal static class PromptBuilder
{
    public static string Build(
        string sourceCode,
        string fileName,
        Dictionary<string, string> additionalContext)
    {
        var contextBlocks = string.Join(
            "\n\n",
            additionalContext.Select(kvp => $$"""
Archivo de contexto: {{kvp.Key}}
{{kvp.Value}}
"""));

        return $$"""
Genera tests unitarios en C# para el siguiente archivo del proyecto.

IMPORTANTE:
- Debes usar EXCLUSIVAMENTE los tipos, namespaces, métodos y firmas que aparezcan en el código proporcionado.
- No inventes entidades, DTOs, nombres de métodos ni tipos alternativos.
- Si un repositorio devuelve GetGalaResponse o List<GetGalaResponse>, usa exactamente esos tipos.
- No uses Backend.Models.Gala salvo que aparezca explícitamente en las firmas mostradas.
- Devuelve SOLO código C#.
- No devuelvas explicaciones.
- No devuelvas markdown.
- No devuelvas bloques con comillas invertidas.

Reglas:
- Usa xUnit.
- Usa NSubstitute.
- Usa FluentAssertions.
- Usa Arrange / Act / Assert.
- Los nombres de tests deben ser descriptivos en español.
- Mockea dependencias inyectadas por constructor.
- Cubre happy path y ramas principales de error.
- El código debe ser lo más cercano posible a compilar sin cambios.

Archivo objetivo:
{{fileName}}

Código fuente principal:
{{sourceCode}}

Contexto adicional del proyecto:
{{contextBlocks}}
""";
    }

    public static string BuildRepairPrompt(
        string originalPrompt,
        string generatedCode,
        string compilerErrors)
    {
        return $$"""
Has generado unos tests unitarios en C# que no compilan.

Tu tarea es corregirlos.

Reglas obligatorias:
- Devuelve SOLO código C# corregido.
- No incluyas explicaciones.
- No incluyas markdown.
- No incluyas bloques con comillas invertidas.
- Respeta estrictamente los tipos y firmas del contexto original.
- No inventes tipos.

Prompt original:
{{originalPrompt}}

Código generado que falla:
{{generatedCode}}

Errores de compilación:
{{compilerErrors}}
""";
    }
}