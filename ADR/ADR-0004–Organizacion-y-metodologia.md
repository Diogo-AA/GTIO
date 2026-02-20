# ADR-004 – Organización del Equipo y Metodología de Gestión

* Estado: Aceptado  
* Responsables: Jon Arriazu, Diogo Da Cunha, Cristian Meneses  
* Fecha: 2026-02-18  

Historia técnica: Definición del marco de trabajo, estructura organizativa y cultura operativa para garantizar la evolución del proyecto a largo plazo (10 años).

---

## Contexto y Planteamiento del Problema

El proyecto "Votación - Operación Triunfo" presenta retos descritos en el RFI que requieren una estructura sólida:

- **Mantenimiento a largo plazo:** Necesidad de transferencia de conocimiento para una vida útil de 10 años.
- **Cargas masivas y criticidad:** Respuesta inmediata ante incidencias durante las galas en directo.
- **Despliegues híbridos:** Operación dual en local y nube mediante Docker.
- **Requisitos volátiles:** Cambios rápidos en las dinámicas del programa de TV.

El problema a resolver es:

¿Cómo organizamos al equipo y qué metodología de trabajo adoptamos para asegurar agilidad en el desarrollo y estabilidad en la operación?

---

## Factores en la Decisión

* Adaptabilidad ante cambios de requisitos.
* Reducción de riesgos en despliegues (evitar el efecto "Big Bang").
* Alineación con los requisitos técnicos de Docker y microservicios.
* Sostenibilidad del conocimiento técnico (evitar silos).
* Capacidad de respuesta ante incidencias en producción.

---

## Opciones Consideradas

* **Metodología en Cascada (Waterfall):** Fases secuenciales rígidas.
* **Kanban:** Flujo continuo de trabajo sin iteraciones fijas.
* **Scrum (Framework Ágil) + Cultura DevOps:** Trabajo iterativo con equipo multidisciplinar.

---

## Decisión

Opción elegida: **"Scrum + Cultura DevOps"**, porque:

- Permite realizar entregas funcionales cada 2 semanas, validando la arquitectura constantemente.
- Fomenta un Equipo Multidisciplinar (Cross-Functional Squad) donde no hay silos entre desarrollo y sistemas.
- Implementa la filosofía , haciendo al equipo responsable de su código en producción.
- Facilita la gestión de cambios entre galas sin romper la planificación anual.
- Garantiza que la infraestructura (Dockerfiles, Compose) se trate como código (**IaC**).

---

## Estructura Operativa

Para la implementación de esta decisión, el equipo se organiza bajo los siguientes pilares:

### 1. Roles del Equipo
* **Product Owner:** Prioriza el Product Backlog según el valor de negocio.
* **Scrum Master:** Facilita ceremonias y elimina impedimentos.
* **Equipo de Desarrollo (Dev & Ops):** Responsabilidad compartida en microservicios, Docker y monitorización.

### 2. Ceremonias (Ciclos de 2 semanas)
* **Sprint Planning:** Selección de tareas en GitHub Projects.
* **Sprint Review:** Demo del incremento de software al cliente.
* **Sprint Retrospective:** Análisis de mejora continua de procesos.

---

## Consecuencias

### Positivas

* **Visibilidad constante:** El cliente valida progreso real cada quincena.
* **Calidad integrada:** Las configuraciones de Docker se prueban desde el inicio del desarrollo.
* **Respuesta rápida (MTTR):** Reducción del tiempo de resolución al ser el mismo equipo quien desarrolla y opera.
* **Mitigación del "Factor Bus":** Conocimiento compartido que asegura el mantenimiento a 10 años.

### Negativas

* **Sobrecarga de gestión:** Las ceremonias de Scrum requieren tiempo y disciplina estricta.
* **Curva de aprendizaje:** Exige que los desarrolladores dominen conceptos de operaciones (Docker) y viceversa.

---

## Ventajas y Desventajas de las opciones

### Scrum + Cultura DevOps

* **Positivo**, porque se alinea con la necesidad de entregas frecuentes y alta estabilidad.
* **Positivo**, porque elimina cuellos de botella entre departamentos.
* **Negativo**, porque requiere una alta madurez técnica y colaborativa del equipo.

### Metodología en Cascada (Waterfall)

* **Positivo**, por su predictibilidad en entornos estáticos.
* **Negativo**, porque es demasiado rígida para el entorno cambiante de la televisión.
* **Negativo**, porque aumenta el riesgo de fallos críticos en el despliegue final.

### Kanban

* **Positivo**, porque es excelente para la gestión de mantenimiento y soporte.
* **Negativo**, porque carece de los hitos temporales (Sprints) necesarios para las fechas estrictas de las galas.

---

## Enlaces

* ADR-0001:Herramientas de gestión del proyecto
* ADR-0002:Normas de commits y ramas Trazabilidad del Sprint.
* ADR-0003:Gestión de Base de Datos MySQL Contenerización DevOps.
