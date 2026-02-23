# ADR-009 – Organización del Equipo y Metodología de Gestión

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
* Reducción de riesgos en despliegues.
* Alineación con los requisitos técnicos de Docker y microservicios.
* Sostenibilidad del conocimiento técnico (evitar silos).
* Capacidad de respuesta ante incidencias en producción.

---

## Opciones Consideradas

* **Scrum Completo:** Demasiado rígido (requiere iteraciones cerradas, dailies y roles estrictos).
* **Cascada (Waterfall):** Inviable por los cambios constantes del entorno televisivo.
* **Metodología Ágil Híbrida + Cultura DevOps:** Adaptar conceptos ágiles según la necesidad real.

---

## Decisión

Opción elegida: **"Metodología Híbrida inspirada en marcos Ágiles y DevOps "**, porque:

- **Flexibilidad:** Se adoptan ideas de agilidad (como el uso de tableros y priorización) pero sin la obligación de realizar iteraciones (Sprints) fijas o reuniones diarias (Dailies).
- **Responsabilidad Compartida:** No se asignan roles estáticos; el equipo opera de forma multidisciplinar donde cualquiera puede intervenir en el desarrollo o la infraestructura.
- **Cultura DevOps:** Se prioriza que el software sea siempre "desplegable" mediante Docker, tratando la configuración como parte del código.
- **Comunicación Asíncrona:** Se favorece el flujo de información continuo sobre las ceremonias formales.

---

## Organización del Trabajo

Para mantener el orden sin añadir sobrecarga, el equipo se basa en:

1. **Gestión por Tablero:** Uso de GitHub Projects para visualizar el estado de las tareas (Backlog, En progreso, Hecho).
2. **Infraestructura como Código:** El despliegue no es una fase aparte; los Dockerfiles y el Compose se desarrollan junto con la lógica de negocio.
3. **Colaboración Directa:** Resolución de dudas y coordinación mediante canales ágiles (Discord/WhatsApp) en lugar de reuniones programadas.

---

## Consecuencias

### Positivas

* **Baja fricción:** Menos tiempo dedicado a reuniones y procesos, más tiempo para el desarrollo técnico.
* **Adaptabilidad:** Permite pivotar tareas rápidamente si surgen problemas técnicos o cambios en el RFI.
* **Autonomía:** Los miembros del equipo tienen libertad para organizarse según su disponibilidad y carga técnica.

### Negativas

* **Riesgo de desincronización:** Al no haber reuniones fijas (Dailies), requiere que la comunicación por Discord sea constante y clara.
* **Dependencia de la proactividad:** Exige que cada miembro actualice el estado de sus tareas de forma voluntaria.

---

## Ventajas y Desventajas de las opciones

### Metodología Híbrida (Elegida)

* **Positivo**, porque se adapta al ritmo real de trabajo del equipo.
* **Positivo**, porque reduce la burocracia de gestión.
* **Negativo**, porque requiere mayor disciplina individual para mantener la trazabilidad.

### Scrum (Framework completo)

* **Positivo**, por el control exhaustivo del tiempo.
* **Negativo**, porque las iteraciones y roles fijos no encajan con la dinámica actual del equipo.

---

## Enlaces

* ADR-0001:Herramientas de gestión del proyecto
* ADR-0002:Normas de commits y ramas Trazabilidad del Sprint.
* ADR-0003:Gestión de Base de Datos MySQL Contenerización DevOps.
