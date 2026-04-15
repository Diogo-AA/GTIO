# ADR-0007 – Estandarización de Calidad y Seguridad del Código

**Estado:** Aceptado
**Responsables:** Jon Arriazu, Diogo Da Cunha, Cristian Meneses y Javier Toussent Fis
**Fecha:** 2026-04-05
**Historia técnica:** Implementación de herramientas de análisis estático, formateo y revisión automatizada de código.

## Contexto y Planteamiento del Problema

El código base se degrada rápidamente si dependemos de la disciplina manual de los desarrolladores para formatear el código y buscar vulnerabilidades.

¿Qué conjunto de herramientas de formateo, análisis estático y seguridad implementamos en el pipeline y en local para forzar un estándar de calidad automático?

## Factores en la Decisión

  * Integración nativa con el ecosistema de GitHub.
  * Bloqueo estricto de código vulnerable o mal estructurado antes de hacer merge.
  * Soporte nativo para C# (.NET) y JavaScript/TypeScript.

## Opciones Consideradas

  * GitHub Native + SonarCloud + Formateadores dogmáticos (Prettier/CSharpier)
  * Herramientas de terceros integradas manualmente (Snyk + ESLint/Roslyn Analyzers + Formateo del IDE)
  * Configuraciones por defecto de Visual Studio / VS Code de cada desarrollador

## Decisión

Opción elegida: **"GitHub Native + SonarCloud + Formateadores dogmáticos (Prettier/CSharpier)"**, porque delega la seguridad en herramientas integradas directamente en nuestro proveedor (Dependabot/CodeQL), usa IA (Copilot) para acelerar las PRs, y, lo más importante, impone formateadores dogmáticos. SonarCloud actúa como una red de seguridad secundaria para *code smells* y bugs lógicos.

### Consecuencias

  * **Positiva:** El código siempre tiene exactamente el mismo aspecto, sin importar quién lo escriba.
  * **Positiva:** Detección de vulnerabilidades de día cero o dependencias rotas antes de desplegar a producción.
  * **Negativa:** La ejecución de estas herramientas ralentizará ligeramente el pipeline de CI y el flujo local.

## Ventajas y Desventajas de las opciones

### GitHub Native + SonarCloud + Formateadores dogmáticos (Prettier/CSharpier)

  * Positivo, porque elimina la carga cognitiva de decidir cómo formatear el código.
  * Positivo, porque Dependabot y CodeQL corren de forma transparente en la infraestructura de GitHub.
  * Negativo, porque requiere cuentas y gestión de permisos adicionales (SonarCloud).

### Herramientas de terceros manuales (Snyk + ESLint/Roslyn Analyzers + IDE)

  * Positivo, porque permite un control extremadamente granular de las reglas.
  * Negativo, porque mantener reglas sincronizadas entre múltiples repositorios y entornos locales es un infierno de mantenimiento.

### Configuraciones por defecto del IDE de cada desarrollador

  * Positivo, porque no requiere esfuerzo inicial de configuración.
  * Negativo, porque garantiza un repositorio inconsistente, conflictos de git (merge conflicts) masivos por diferencias de formato y subida de secretos o código vulnerable por falta de controles. Inaceptable.

## Enlaces

  * ADR-0002 – Buenas Prácticas
  * ADR-0004 – Organizacion y metodologia