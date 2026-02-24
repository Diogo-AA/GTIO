# ADR-0005 – Diseño de Frontend

* Estado: Aceptado  
* Responsables: Jon Arriazu, Diogo Da Cunha, Cristian Meneses  
* Fecha: 2026-02-24  

Historia técnica: Selección de tecnología frontend para el sistema de votación.

---

## Contexto y Planteamiento del Problema

El sistema de votación requiere una interfaz web que:

- Permita interacción clara y sencilla para el usuario.
- Sea mantenible y escalable.
- Pueda evolucionar en complejidad.
- Sea integrable con el backend mediante API REST.
- Sea desplegable junto al resto del sistema en entornos Docker.

La decisión a resolver es:

¿Qué tecnología se utilizará para desarrollar el frontend del sistema?

---

## Opciones Consideradas

- HTML + JavaScript puro
- Angular
- React

---

## Comparativa Técnica

### 1. HTML + JavaScript puro

**Tipo:** Desarrollo tradicional sin framework  
**Modelo:** Manipulación directa del DOM  

**Ventajas:**

- Simplicidad inicial.
- Sin dependencias externas.
- Curva de aprendizaje baja.
- Ideal para prototipos rápidos.

**Desventajas:**

- Escalabilidad limitada.
- Mayor complejidad al crecer el proyecto.
- Difícil mantenimiento en aplicaciones medianas/grandes.
- Gestión manual del estado y del DOM.

**Conclusión parcial:**  
Adecuado para una primera versión simple o prototipo, pero no recomendable como solución a medio/largo plazo.

---

### 2. Angular

**Tipo:** Framework frontend completo  
**Modelo:** Arquitectura estructurada basada en componentes y módulos  

**Ventajas:**

- Arquitectura muy definida.
- Gran robustez para aplicaciones empresariales.
- Herramientas integradas (routing, formularios, inyección de dependencias).

**Desventajas:**

- Curva de aprendizaje elevada.
- Mayor complejidad inicial.
- Puede resultar sobredimensionado para el alcance actual del proyecto.

**Conclusión parcial:**  
Muy potente para aplicaciones grandes, pero introduce complejidad innecesaria en el contexto actual.

---

### 3. React

**Tipo:** Librería frontend basada en componentes  
**Modelo:** Componentes reutilizables y gestión de estado  

**Ventajas:**

- Arquitectura basada en componentes.
- Alta escalabilidad.
- Gran ecosistema y comunidad.
- Curva de aprendizaje moderada.
- Integración sencilla con APIs REST.
- Flexible y adaptable al crecimiento del sistema.

**Desventajas:**

- Requiere configuración inicial.
- Necesidad de estructurar correctamente el proyecto desde el inicio.

**Conclusión parcial:**  
Solución equilibrada entre simplicidad y escalabilidad.

---

## Decisión

Opción elegida: **React**

Justificación:

Actualmente se dispone de una primera versión simple desarrollada en HTML + JavaScript puro con fines iniciales y de validación básica.

Sin embargo, dado que el sistema está diseñado para evolucionar y escalar en funcionalidad, se considera necesario adoptar una tecnología que:

- Permita modularización.
- Facilite mantenimiento.
- Mejore organización del código.
- Soporte crecimiento futuro sin refactorizaciones estructurales profundas.

React ofrece:

- Modelo basado en componentes.
- Gestión clara del estado.
- Escalabilidad progresiva.
- Amplia adopción en entornos productivos.
- Buen encaje con arquitectura basada en API REST.

La versión actual en HTML + JS se considera temporal y podrá migrarse progresivamente a React.

---

## Consecuencias

### Positivas

- Mejor organización del código.
- Mayor mantenibilidad.
- Escalabilidad futura garantizada.
- Ecosistema amplio de herramientas.
- Integración sencilla con backend existente.

### Negativas

- Mayor complejidad inicial frente a HTML + JS.
- Necesidad de adaptación del equipo al framework.


---

Esta decisión se considera adecuada para el alcance actual del proyecto y su evolución prevista.
