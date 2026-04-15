# ADR-0006 – Elección del Framework de Backend

* Estado: Aceptado
* Responsables: Jon Arriazu, Diogo Da Cunha, Cristian Meneses
* Fecha: 2026-02-24

Historia técnica: Selección de la tecnología y framework para la API del sistema de votación.

## Contexto y Planteamiento del Problema

El sistema de votación para OT necesita una API backend robusta capaz de gestionar usuarios, autenticación y autorización, y registrar votos concurrentes contra una base de datos MySQL. El sistema debe ser altamente eficiente, fácil de contenerizar con Docker para su despliegue dual (local y nube), y mantenerse estable durante un ciclo de vida de 10 años.

El problema a resolver es:
¿Qué tecnología, lenguaje y herramientas de acceso a datos utilizamos para construir la API del backend garantizando alto rendimiento y mantenibilidad?

## Factores en la Decisión

* Rendimiento y consumo de recursos bajo concurrencia (galas en directo).
* Tipado estático para evitar errores en tiempo de ejecución.
* Simplicidad en la contenerización (Docker).
* Ecosistema maduro y soporte a largo plazo.
* Eficiencia en el acceso a base de datos.

## Opciones Consideradas

* C# con ASP.NET Core (.NET 10) + Dapper
* Node.js (Express / NestJS)
* Python (FastAPI)
* Java (Spring Boot)

## Decisión

Opción elegida: **"C# con ASP.NET Core (.NET 10) + Dapper"**, porque:

ASP.NET Core en .NET 10 ofrece un [rendimiento líder](https://web-frameworks-benchmark.netlify.app/result?f=aspnet-minimal-api,spring,express,fastapi,django,flask,nestjs-express,nestjs-fastify) en la industria para APIs web. Se ha elegido explícitamente Dapper como herramienta de acceso a datos sobre opciones como Entity Framework o ADO.NET, ya que Dapper permite mapear resultados de consultas SQL puras directamente a objetos C# con una sobrecarga casi nula, garantizando [tiempos de respuesta mínimos](https://github.com/DapperLib/Dapper?tab=readme-ov-file#performance) durante picos de carga. Además, varios integrantes del equipo tienen experiencia trabajando con esta tecnología.

### Consecuencias

* **Positiva:** Rendimiento extremo y baja latencia en la inserción y consulta de votos.
* **Positiva:** Código estructurado, fuertemente tipado y fácil de refactorizar.
* **Positiva:** Control total sobre las consultas SQL en MySqlConnector gracias a Dapper.
* **Negativa:** Mayor verbosidad en comparación con lenguajes de scripting interpretados como Python o JavaScript.

## Ventajas y Desventajas de las opciones

### C# con ASP.NET Core (.NET 10) + Dapper

* Positivo, porque el rendimiento de .NET y Dapper es excepcionalmente alto.
* Positivo, porque el equipo cuenta con experiencia previa en esta tecnología.
* Negativo, porque obliga a mantener y escribir sentencias SQL manualmente.

### Node.js (Express / NestJS)

* Positivo, porque permite usar el mismo lenguaje (JavaScript/TypeScript) en frontend y backend.
* Negativo, porque el modelo de un solo hilo puede ser un cuello de botella en operaciones intensivas.
* Negativo, porque el ecosistema de paquetes (NPM) ha sufrido recientemente múltiple ataques a la cadena de suministro.

### Python (FastAPI)

* Positivo, porque es rápido de desarrollar y escribir.
* Negativo, porque el rendimiento bruto de Python es lento comparado con lenguajes compilados como C#.
* Negativo, porque Python es un lenguaje no tipado.

### Java (Spring Boot)

* Positivo, porque es robusto y maduro.
* Negativo, porque consume excesiva memoria RAM y el tiempo de arranque de los contenedores es insuficiente para escalar rápidamente.

## Enlaces

* ADR-0003: Elección del Sistema de BBDD
* ADR-0004: Organización y Metodología