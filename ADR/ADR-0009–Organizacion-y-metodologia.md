
ADR-0004 – Organización del Equipo y Metodología de Gestión
Estado: Aceptado

Responsables: Jon Arriazu, Diogo Da Cunha, Cristian Meneses

Fecha: 2026-02-18

Historia técnica: Definición del marco de trabajo (framework), estructura organizativa y cultura operativa para garantizar la evolución y mantenimiento del proyecto durante los próximos 10 años.

Contexto y Planteamiento del Problema
El proyecto "Votación - Operación Triunfo" presenta retos específicos descritos en el RFI:

Vida útil larga (10 años): Requiere un mantenimiento sostenible y transferencia de conocimiento.

Cargas masivas: Exige una respuesta rápida ante incidencias en producción (gales en directo).

Despliegues híbridos: Necesidad de operar tanto en local como en nube usando Docker.

Evolución constante: Los requisitos del programa de TV pueden cambiar rápidamente.

El problema a resolver es:
¿Cómo organizamos al equipo y qué metodología de trabajo adoptamos para asegurar agilidad en el desarrollo y estabilidad en la operación?

Opciones Consideradas
1. Metodología en Cascada (Waterfall)
Descripción: Fases secuenciales (Requisitos -> Diseño -> Desarrollo -> Test -> Despliegue).

Descarte: Demasiado rígida para un entorno televisivo cambiante. Riesgo alto de fallos en el despliegue final ("Big Bang").

2. Kanban
Descripción: Flujo continuo de trabajo sin iteraciones fijas.

Descarte: Aunque útil para mantenimiento, carece de los hitos temporales necesarios (Sprints) para las fechas de entrega estrictas de las galas del programa.

3. Scrum (Framework Ágil) + Cultura DevOps
Descripción: Trabajo iterativo e incremental (Sprints) con un equipo multidisciplinar que asume tanto el desarrollo como la operación.

Selección: Se alinea con la necesidad de entregas frecuentes y alta estabilidad técnica.

Decisión
Se decide adoptar el marco de trabajo Scrum combinado con una cultura DevOps.

1. Organización del Equipo (Roles)
Para evitar silos de información y cuellos de botella, no se separará al equipo en departamentos estancos (Desarrollo vs. Sistemas). Se formará un Equipo Multidisciplinar (Cross-Functional Squad):

Product Owner (Cliente/Bermejo Inc.): Define el "qué". Prioriza la lista de requisitos (Product Backlog) según el valor de negocio para el programa.

Scrum Master: Facilita las ceremonias, elimina impedimentos y protege al equipo de interrupciones externas.

Equipo de Desarrollo (Developers & Ops):

No hay distinción rígida. Todos los miembros colaboran en la implementación.

Responsabilidades compartidas: Desarrollo de microservicios, creación de Dockerfiles, configuración de Docker Compose y monitorización.

Nota: Al menos un miembro actuará como referente técnico en infraestructura (SRE/DevOps champion), pero la responsabilidad del despliegue es del equipo entero.

2. Metodología de Gestión (Scrum)
El ciclo de vida se organizará en Sprints de 2 semanas:

Sprint Planning: Selección de historias de usuario del Backlog (gestionado en GitHub Projects, ver).

Daily Standup: Reunión de 15 min para sincronización diaria (vía Discord/Presencial).

Sprint Review: Demostración del incremento de software funcionando al cliente al final de cada Sprint.

Sprint Retrospective: Análisis de mejora continua del equipo (procesos y herramientas).

3. Cultura DevOps ("You build it, you run it")
Dado el requisito de usar Docker y microservicios:

El equipo de desarrollo es responsable de que su código funcione en producción.

La infraestructura (Dockerfiles, Compose) se trata como código (IaC) y vive en el mismo repositorio (ver).

La calidad se asegura mediante integración continua antes del despliegue.

Justificación
La elección de Scrum + DevOps se justifica por:

Adaptabilidad: Permite incorporar cambios en las reglas de votación entre galas sin romper la planificación anual.

Reducción de Riesgos: Al realizar entregas funcionales cada 2 semanas, se validan la arquitectura y los contenedores Docker constantemente, no al final del proyecto.

Alineación con el RFI: El cliente solicita explícitamente metodologías ágiles y capacidad de despliegue en diversos entornos. DevOps garantiza que el software sea "desplegable" desde el primer día.

Mantenimiento a 10 años: Al compartir el conocimiento en un equipo multidisciplinar, se evita que la salida de una persona clave ponga en riesgo el proyecto (Factor Bus).

Consecuencias
Positivas
Visibilidad constante: El cliente ve progreso real cada quincena.

Calidad desde el origen: Los Dockerfiles y configuraciones se prueban durante el desarrollo, no en una fase posterior de "sistemas".

Respuesta rápida: En caso de fallo durante una votación, el equipo que construyó el sistema es el mismo que lo opera, reduciendo el tiempo de resolución (MTTR).

Negativas
Sobrecarga de comunicación: Las ceremonias de Scrum requieren tiempo y disciplina.

Curva de aprendizaje: Requiere que los desarrolladores aprendan conceptos de operaciones (Docker) y viceversa.

Relación con otros ADRs
ADR-0001: El seguimiento de los Sprints y el Backlog se realizará mediante los tableros de GitHub Projects.

ADR-0002: Las normas de commits y ramas se aplicarán para garantizar que cada incremento del Sprint tenga trazabilidad y calidad.

ADR-0003: La base de datos MySQL será gestionada y contenerizada siguiendo esta metodología DevOps.