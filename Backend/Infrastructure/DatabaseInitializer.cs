using Dapper;
using MySqlConnector;

namespace Backend.Infrastructure;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("DatabaseInitializer");
        var dataSource = scope.ServiceProvider.GetRequiredService<MySqlDataSource>();

        const string sql = """
                CREATE TABLE IF NOT EXISTS candidatos (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  nombre VARCHAR(100) NOT NULL
                );

                CREATE TABLE IF NOT EXISTS gala (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  nombre VARCHAR(100) NOT NULL,
                  fecha DATE NOT NULL
                );

                CREATE TABLE IF NOT EXISTS gala_candidatos (
                  gala_id INT NOT NULL,
                  candidato_id INT NOT NULL,
                  PRIMARY KEY (gala_id, candidato_id),
                  FOREIGN KEY (gala_id) REFERENCES gala(id),
                  FOREIGN KEY (candidato_id) REFERENCES candidatos(id)
                );

                CREATE TABLE IF NOT EXISTS votos (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  fecha DATETIME NOT NULL,
                  usuario VARCHAR(255) NOT NULL,
                  candidato INT NOT NULL,
                  gala INT NOT NULL,
                  FOREIGN KEY (candidato) REFERENCES candidatos(id),
                  FOREIGN KEY (gala) REFERENCES gala(id)
                );

                INSERT INTO gala (id, nombre, fecha)
                VALUES (1, 'Gala Principal', '2026-03-01')
                ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), fecha = VALUES(fecha);

                INSERT INTO candidatos (id, nombre)
                VALUES
                  (1, 'Candidato A'),
                  (2, 'Candidato B'),
                  (3, 'Candidato C')
                ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

                INSERT IGNORE INTO gala_candidatos (gala_id, candidato_id)
                VALUES (1, 1), (1, 2), (1, 3);
            """;

        for (var attempt = 1; attempt <= 10; attempt++)
        {
            try
            {
                await using var connection = await dataSource.OpenConnectionAsync();
                await connection.ExecuteAsync(sql);
                logger.LogInformation("Database schema and seed data are ready");
                return;
            }
            catch (Exception ex) when (attempt < 10)
            {
                logger.LogWarning(
                    ex,
                    "Database initialization failed on attempt {Attempt}. Retrying...",
                    attempt
                );
                await Task.Delay(TimeSpan.FromSeconds(5));
            }
        }
    }
}
