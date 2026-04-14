# ADR-0001 – Herramientas de gestión del proyecto

* Estado: Aceptado  
* Responsables: Jon Arriazu, Diogo Da Cunha, Cristian Meneses  
* Fecha: 2026-02-16  

Historia técnica: Organización y coordinación del proyecto.

---

## Contexto y Planteamiento del Problema

El equipo necesita una herramienta centralizada para:

- Gestionar tareas.
- Asignar responsables.
- Hacer seguimiento del avance.
- Mantener trazabilidad técnica entre tareas y entregables.

El problema a resolver es:

¿Qué herramienta de gestión utilizamos para coordinar el proyecto y asegurar trazabilidad entre tareas y entregables técnicos?

---

## Factores en la Decisión

* Trazabilidad entre tareas y código.
* Facilidad de uso para todo el equipo.
* Integración con repositorio Git.
* Coste (preferible gratuito).
* Curva de aprendizaje.
* Centralización de la información.

---

## Opciones Consideradas

* GitHub (repo + Projects)
* Excel
* Jira
* Microsoft Teams
* GitLab
* Google Suite (Gsuite)

---

## Decisión

Opción elegida: "GitHub (Repositorio + Projects)", porque:

- Permite gestionar código y tareas en el mismo entorno.
- Ofrece trazabilidad directa entre commits, branches, pull requests e issues.
- Es gratuito para repositorios privados básicos.
- Reduce herramientas externas y fragmentación de información.
- Facilita el trabajo colaborativo mediante Pull Requests y revisión de código.

---

## Herramientas de comunicación adicional

Además de GitHub como herramienta principal de gestión, el equipo utiliza:

* **WhatsApp** como canal de comunicación directa.
* **Discord** como canal para la elaboración y coordinación de reuniones, y como sistema para almacenar notas y acuerdos derivados de las propias reuniones.

Su finalidad es:

- Coordinación rápida entre miembros.
- Resolución ágil de dudas puntuales.
- Apoyo en la toma de decisiones inmediatas.
- Organización informal de reuniones o tareas urgentes.
- Preparación de reuniones (agenda, puntos a tratar y reparto de tareas).
- Registro de notas, acuerdos y seguimiento de acciones tras cada reunión.

WhatsApp y Discord no sustituyen a GitHub como sistema de gestión formal, sino que actúan como herramientas complementarias de comunicación interna.

---

## Consecuencias

### Positivas

* Trazabilidad completa: issue → branch → commit → pull request → merge.
* Gestión visual mediante tableros tipo Kanban.
* Historial técnico auditable.
* Colaboración estructurada con revisión de código.
* Comunicación ágil para coordinación diaria.

### Negativas

* Requiere disciplina en el uso de issues y commits.
* Curva inicial de aprendizaje para miembros con poca experiencia en Git.

---

## Ventajas y Desventajas de las opciones

### GitHub (Repositorio + Projects)

* Positivo, porque integra gestión y desarrollo en una sola plataforma.
* Positivo, porque permite vincular tareas (#issue) con commits y PR.
* Positivo, porque es ampliamente usado en entornos profesionales.
* Negativo, porque requiere conocimientos básicos de Git.
* Negativo, porque depende de la disciplina en el uso de issues y commits.

---

### Excel

* Positivo, porque es simple y conocido por todos.
* Positivo, porque no requiere curva técnica.
* Negativo, porque no tiene trazabilidad con el código.
* Negativo, porque no permite automatización ni control de versiones colaborativo real.
* Negativo, porque genera múltiples versiones del mismo documento.

---

### Jira

* Positivo, porque es muy potente para gestión ágil.
* Positivo, porque ofrece métricas y reporting avanzado.
* Negativo, porque añade complejidad innecesaria para este proyecto.
* Negativo, porque puede implicar costes.

---

### Microsoft Teams

* Positivo, porque facilita comunicación.
* Positivo, porque es útil para coordinación síncrona.
* Negativo, porque no tiene trazabilidad con commits.

---

### GitLab

* Positivo, porque integra repositorio y gestión.
* Positivo, porque es comparable técnicamente a GitHub.
* Negativo, porque implicaría migración y curva de aprendizaje adicional.

---

### Google Suite (Gsuite)

* Positivo, porque permite colaboración documental.
* Negativo, porque no tiene integración nativa con control de versiones Git.
* Negativo, porque no permite trazabilidad técnica entre tareas y código.

---

## Enlaces

* https://github.com/Diogo-AA/GTIO/ADR/ADR-0001–Herramientas-de-gestión.md