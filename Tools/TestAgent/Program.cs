using System.Text;

namespace TestAgent;

internal class Program
{
    private static async Task<int> Main(string[] args)
    {
        try
        {
            var options = ParseArguments(args);

            if (options is null)
            {
                PrintUsage();
                return 1;
            }

            var apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY");
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                Console.Error.WriteLine("Error: la variable de entorno GROQ_API_KEY no está definida.");
                return 1;
            }

            if (!File.Exists(options.InputFile))
            {
                Console.Error.WriteLine($"Error: no existe el fichero de entrada: {options.InputFile}");
                return 1;
            }

            var sourceCode = await File.ReadAllTextAsync(options.InputFile, Encoding.UTF8);
            var fileName = Path.GetFileName(options.InputFile);
            var additionalContext = LoadAdditionalContext(options.InputFile);

            Console.Error.WriteLine($"Generando tests para {fileName} con el modelo {options.Model}...");

            var generator = new GroqTestGenerator(apiKey);
            var prompt = PromptBuilder.Build(sourceCode, fileName, additionalContext);

            var generatedCode = await generator.GenerateTestsAsync(prompt, options.Model, options.Temperature);

            if (string.IsNullOrWhiteSpace(generatedCode))
            {
                Console.Error.WriteLine("Error: Groq devolvió una respuesta vacía.");
                return 1;
            }

            if (!string.IsNullOrWhiteSpace(options.OutputFile))
            {
                var outputDirectory = Path.GetDirectoryName(options.OutputFile);
                if (!string.IsNullOrWhiteSpace(outputDirectory))
                {
                    Directory.CreateDirectory(outputDirectory);
                }

                await File.WriteAllTextAsync(options.OutputFile, generatedCode, Encoding.UTF8);
                Console.Error.WriteLine($"Tests guardados en: {options.OutputFile}");
            }
            else
            {
                Console.WriteLine(generatedCode);
            }

            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("Error inesperado:");
            Console.Error.WriteLine(ex.Message);
            return 1;
        }
    }

    private static Dictionary<string, string> LoadAdditionalContext(string inputFile)
    {
        var fileName = Path.GetFileName(inputFile);

        return fileName switch
        {
            "VotingService.cs" => LoadFiles(new[]
            {
                "Backend/Data/IGalaRepository.cs",
                "Backend/Data/IVotoRepository.cs",
                "Backend/Contracts/Requests/CrearVotoRequest.cs",
                "Backend/Contracts/Responses/GetGalaResponse.cs",
                "Backend/Contracts/Responses/GetGalasResponse.cs"
            }),
            _ => new Dictionary<string, string>()
        };
    }

    private static Dictionary<string, string> LoadFiles(IEnumerable<string> files)
    {
        var result = new Dictionary<string, string>();

        foreach (var file in files)
        {
            if (File.Exists(file))
            {
                result[file] = File.ReadAllText(file, Encoding.UTF8);
            }
        }

        return result;
    }

    private static Options? ParseArguments(string[] args)
    {
        if (args.Length == 0)
        {
            return null;
        }

        string? inputFile = null;
        string? outputFile = null;
        string model = "llama-3.3-70b-versatile";
        decimal temperature = 0.1m;

        for (var i = 0; i < args.Length; i++)
        {
            var arg = args[i];

            switch (arg)
            {
                case "--output":
                case "-o":
                    if (i + 1 >= args.Length) return null;
                    outputFile = args[++i];
                    break;

                case "--model":
                case "-m":
                    if (i + 1 >= args.Length) return null;
                    model = args[++i];
                    break;

                case "--temperature":
                case "-t":
                    if (i + 1 >= args.Length) return null;
                    if (!decimal.TryParse(
                            args[++i],
                            System.Globalization.NumberStyles.Number,
                            System.Globalization.CultureInfo.InvariantCulture,
                            out temperature))
                    {
                        return null;
                    }
                    break;

                case "--help":
                case "-h":
                    return null;

                default:
                    if (inputFile is null)
                    {
                        inputFile = arg;
                    }
                    else
                    {
                        return null;
                    }
                    break;
            }
        }

        if (string.IsNullOrWhiteSpace(inputFile))
        {
            return null;
        }

        return new Options(inputFile, outputFile, model, temperature);
    }

    private static void PrintUsage()
    {
        Console.WriteLine("""
Uso:
  dotnet run --project Tools/TestAgent -- <fichero.cs> [--output <fichero_tests.cs>] [--model <modelo>] [--temperature <valor>]

Ejemplos:
  dotnet run --project Tools/TestAgent -- Backend/Services/VotingService.cs
  dotnet run --project Tools/TestAgent -- Backend/Services/VotingService.cs --output Tests/Unit/Services/VotingServiceTests.generated.cs
  dotnet run --project Tools/TestAgent -- Backend/Services/VotingService.cs --model llama-3.3-70b-versatile
""");
    }

    private sealed record Options(
        string InputFile,
        string? OutputFile,
        string Model,
        decimal Temperature);
}