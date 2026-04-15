# Guía de Configuración y Herramientas del Proyecto

Este documento detalla las herramientas impuestas en este repositorio para asegurar la calidad y seguridad del código.

## 1. ¿Qué usamos y para qué sirve?

  * **Dependabot:** Automatiza la actualización de dependencias y avisa si se está usando librerías con vulnerabilidades conocidas.
  * **CodeQL:** Motor de análisis semántico integrado en GitHub. Escanea estáticamente el repositorio buscando vulnerabilidades de seguridad en el código fuente.
  * **Copilot para PRs:** Asistente de IA que revisa los Pull Requests para detectar problemas de calidad y/o seguridad.
  * **SonarCloud:** Linter en la nube. Bloquea la PR si introduces *code smells*, bugs de mantenibilidad o se reduce la cobertura de tests por debajo del estándar.
  * **Prettier:** Formateador dogmático para JS/TS.
  * **CSharpier:** Formateador dogmático para C#.

> **IMPORTANT**  
> Hay un Ruleset en GitHub activo. **NO** se puede hacer merge de ninguna Pull Request si los escaneos arrojan niveles de `Error` o vulnerabilidades `High/Critical`.

-----

## 2. Configuración del Entorno (VS Code)

### 2.1. Linter Local (SonarCloud)

1.  Instala la extensión oficial: [SonarQube for IDE](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode).
2.  Incluye esto en `settings.json` para que analice mientras escribes:
    ```json
    "sonarlint.automaticAnalysis": true
    ```
3.  Regístrate en [SonarCloud](https://sonarcloud.io/login) y pide al administrador que te meta en la organización. Sigue el asistente de la extensión en VS Code para enlazar el proyecto.

### 2.2. Formateadores (Prettier y CSharpier)

1.  Instala las extensiones:
      * [CSharpier - Code formatter](https://marketplace.visualstudio.com/items?itemName=csharpier.csharpier-vscode)
      * [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
2.  Abre `settings.json` de VS Code y fuerza el formateo automático al guardar el archivo.
    ```json
    "[csharp]": {
        "editor.defaultFormatter": "csharpier.csharpier-vscode",
        "editor.formatOnSave": true
    },
    "[javascript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.formatOnSave": true
    },
    "[typescript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.formatOnSave": true
    }
    ```

-----

## 3. Integración de Pre-commit Hooks

Para asegurar el estilo del código se usan hooks locales.

1.  Instala [pipx](https://www.google.com/search?q=https://github.com/pypa/pipx%3Ftab%3Dreadme-ov-file%23install-pipx) (opción recomendada) o usa `pip`.
2.  Instala la utilidad pre-commit:
    ```bash
    pipx install pre-commit
    ```
3.  Activa los hooks en la raíz del repositorio:
    ```bash
    pre-commit install
    ```

> **NOTE**  
> A partir de ahora, cada vez que hagas un commit, los formateadores y linters se ejecutarán localmente. Si fallan, el commit se aborta.