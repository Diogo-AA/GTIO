# ADR-0002 – Buenas Prácticas de Desarrollo, Uso de GitHub e IA

* Estado: Aceptado  
* Responsables: Jon Arriazu, Diogo Da Cunha, Cristian Meneses   
* Fecha: 2026-02-17  

Historia técnica: Definición de normas internas de trabajo para garantizar calidad, trazabilidad y coherencia en el desarrollo del proyecto.

---

## Contexto y Planteamiento del Problema

El equipo necesita establecer un conjunto de buenas prácticas comunes para:

- Mantener coherencia en el código.
- Garantizar trazabilidad en GitHub.
- Asegurar calidad mínima técnica.
- Definir límites claros en el uso de IA.

La ausencia de normas puede generar código inconsistente, pérdida de trazabilidad y dependencia excesiva de herramientas externas.

---

## Decisión

Se establecen las siguientes buenas prácticas obligatorias para todos los miembros del equipo.

---

# 1. Buenas Prácticas en GitHub

## 1.1 Issues

- Cada tarea debe crearse como **issue**.
- El título debe ser claro y descriptivo.
- La descripción debe estar en castellano.
- Se asignará responsable.
- Se etiquetará cuando proceda (feature, bug, docs, etc.).

---

## 1.2 Branches

- No se trabaja directamente sobre `main`.
- Cada issue tendrá su propia rama.

Nomenclatura recomendada:

- feature/issue-X-nombre-corto
- bugfix/issue-X-nombre-corto
- docs/issue-X-nombre-corto

---

## 1.3 Commits

- Mensajes claros y en castellano.
- Deben describir qué se ha hecho, no cómo.
- Un commit debe representar un cambio lógico concreto.
- Evitar commits masivos sin sentido.

Ejemplo correcto:

- feat: creación de tablas principales de la base de datos


---

## 1.4 Pull Requests

- Todo merge a `main` debe hacerse mediante Pull Request.
- El PR debe referenciar el issue correspondiente.
- Descripción obligatoria en castellano explicando:
  - Qué se ha hecho.
  - Qué impacto tiene.
  - Qué se debería revisar.

---

## 1.5 Tests y Calidad

- Siempre que sea posible se añadirán tests básicos.
- No se hará merge si el código rompe funcionalidad existente.
- Se utilizará linter cuando el lenguaje lo permita.
- El código debe compilar o ejecutarse sin errores antes de subirlo.

---

# 2. Buenas Prácticas de Código

No se busca sobreingeniería, sino claridad y coherencia.

## 2.1 Nomenclatura

- Variables y funciones en minúsculas.
- Nombres descriptivos.
- Evitar abreviaturas innecesarias.
- Mantener un criterio uniforme en todo el proyecto.

Ejemplo correcto:

- calcular_total_votos()


---

## 2.2 Comentarios

- Se comentará el código cuando sea necesario.
- No se comentará lo obvio.
- Los comentarios deben explicar intención o lógica compleja.
- Comentarios en castellano.

---

## 2.3 Organización

- Separación por carpetas según responsabilidad.
- Evitar archivos excesivamente grandes.
- Código modular.
- Preparado para permitir escalabilidad futura.

---

## 2.4 Principios básicos

- Claridad > complejidad.
- Código legible por cualquier miembro del equipo.
- Evitar duplicidad innecesaria.
- Mantener coherencia estructural.

---

# 3. Uso de Inteligencia Artificial

La IA será una herramienta de apoyo, no un sustituto del desarrollador.

## 3.1 Uso permitido

- Apoyo en redacción de documentación.
- Generación de borradores de código.
- Aceleración de tareas repetitivas.
- Consultas técnicas puntuales.

---

## 3.2 Limitaciones

- No se aceptará código generado por IA sin revisión humana.
- El equipo debe comprender el código antes de integrarlo.
- No se dependerá totalmente de la IA.
- La responsabilidad final del código es del desarrollador.

---

## 3.3 Principio general

La IA es un apoyo para ahorrar tiempo, pero:

- El diseño.
- La arquitectura.
- La validación.
- La responsabilidad técnica.

Siempre recaen en el equipo.

---

## Consecuencias

### Positivas

- Código coherente.
- Trazabilidad completa.
- Reducción de errores.
- Mejor mantenimiento futuro.
- Uso responsable de IA.

### Negativas

- Requiere disciplina.
- Puede ralentizar ligeramente al inicio.
- Exige revisión constante.

---

Esta normativa queda establecida como estándar interno del equipo para todo el ciclo de vida del proyecto.

