# ADR-0008 – Agente LLM con Groq para generación asistida de tests

* Estado: Aceptado  
* Responsables: Jon Arriazu, Diogo Da Cunha, Cristian Meneses, , Javier Toussent Fis
* Fecha: 2026-04-14  

Historia técnica: Incorporación de una herramienta de apoyo al desarrollo para generar borradores de tests unitarios.

---

## Contexto y Planteamiento del Problema

El equipo necesita acelerar tareas repetitivas de desarrollo, en particular la creación de tests unitarios, manteniendo revisión humana obligatoria.

La herramienta a incorporar debe:

- Integrarse con el repositorio sin afectar al backend productivo.
- Poder generar borradores de tests en C#.
- Ser sencilla de ejecutar por línea de comandos.
- Tener bajo coste de adopción.

El problema a resolver es:

¿Qué solución utilizamos para incorporar un agente LLM de apoyo a la generación de tests unitarios?

---

## Opciones Consideradas

- Script en Python con Anthropic
- Herramienta en C# con modelo local
- Herramienta en C# conectada a Groq

---

## Decisión

Opción elegida: **Herramienta en C# conectada a Groq**

Justificación:

Se ha elegido una herramienta de consola en C# integrada en el repositorio, conectada mediante API a Groq, para generar borradores de tests unitarios a partir de archivos del backend.

Se prioriza esta opción porque:

- Mantiene coherencia con el stack principal en .NET.
- Evita introducir Python como dependencia adicional.
- Permite usar modelos LLM mediante API con una integración simple.
- No forma parte del runtime del sistema productivo.
- Encaja con el uso de IA como herramienta de apoyo y no como sustitución del desarrollador.

---

## Consecuencias

### Positivas

- Reducción del tiempo de creación de borradores de tests.
- Integración sencilla en el flujo de desarrollo.
- Coherencia tecnológica con el proyecto.
- Posibilidad de extender la herramienta en el futuro.

### Negativas

- El código generado puede requerir correcciones manuales.
- Dependencia de un proveedor externo para la generación.
- Necesidad de gestionar la API key de forma segura.

---

## Enlaces

- ADR-0002: Buenas Prácticas de Desarrollo, Uso de GitHub e IA
- ADR-0006: Elección del Framework de Backend