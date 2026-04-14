# ADR-0007 – Estrategia de testing del frontend

* Estado: Aceptado
* Responsables: Jon Arriazu, Diogo Da Cunha, Cristian Meneses
* Fecha: 2026-03-31

Historia técnica: Definición de la herramienta y enfoque para los tests del frontend React.

---

## Contexto y Planteamiento del Problema

El frontend desarrollado en React requiere una estrategia de testing que permita verificar el comportamiento de la aplicación desde el punto de vista del usuario.

La decisión a resolver es:

¿Qué herramienta y enfoque se utiliza para los tests del frontend?

---

## Opciones Consideradas

- Vitest + Testing Library
- Playwright

---

## Comparativa Técnica

### 1. Vitest + Testing Library

**Tipo:** Tests unitarios e integración de componentes  
**Modelo:** Renderizado de componentes en entorno simulado (jsdom)

**Ventajas:**

- Tests rápidos sin necesidad de levantar el servidor.
- Buena integración con el ecosistema Vite.
- Permite testear componentes de forma aislada.

**Desventajas:**

- Requiere añadir dependencias que actualmente no están en el proyecto (`vitest`, `@testing-library/react`).
- El entorno jsdom no es un navegador real: puede enmascarar problemas reales de renderizado o navegación.
- Necesita mocking de módulos más complejo para simular React Router, i18n, etc.

**Conclusión parcial:**  
Válido para proyectos que priorizan tests unitarios de componentes aislados. No es la opción más directa dado el stack actual.

---

### 2. Playwright

**Tipo:** Tests end-to-end  
**Modelo:** Navegador real contra la aplicación desplegada en Docker

**Ventajas:**

- Prueba el flujo completo tal como lo experimenta el usuario.
- No requiere añadir dependencias al proyecto: Playwright ya está configurado.
- Permite mockear las llamadas a la API con `page.route()`, manteniendo los tests deterministas sin depender del estado de la base de datos.
- Encaja bien con la infraestructura ya existente (Docker Compose con frontend en puerto 5500 y backend en 8081).
- El mismo enfoque sirve para todos los tipos de tests necesarios (navegación, estado de carga, errores, interacciones).

**Desventajas:**

- Los tests son más lentos que los unitarios al requerir un navegador real.
- Requiere tener Docker Compose levantado para ejecutarlos.

**Conclusión parcial:**  
Es la opción natural dado que la infraestructura ya está montada y no requiere cambios en el proyecto.

---

## Decisión

Opción elegida: **Playwright**

Justificación:

El proyecto ya dispone de Docker Compose con frontend y backend, y Playwright está configurado desde el inicio. Añadir Vitest implicaría incorporar nuevas dependencias y un entorno de testing adicional sin una ganancia clara para el tipo de funcionalidad que se quiere verificar (flujos de votación, navegación entre páginas, estados de carga y error).

Playwright permite testear la aplicación real tal como la usa el usuario, mockear las respuestas de la API cuando se necesita aislar el frontend, y verificar textos mediante las traducciones reales del sistema i18n, evitando textos hardcodeados en los tests.

---

## Organización de los tests

Los tests se ubican en `frontend/src/pages/__e2e__/`, con un fichero por página. Existe un helper `i18n.ts` en esa carpeta que carga los ficheros de traducción en Node.js, permitiendo usar `t('clave')` en los tests del mismo modo que en la aplicación.

La carpeta `__e2e__` está excluida de la compilación de Vite (`tsconfig.app.json`) porque utiliza módulos de Node.js que no están disponibles en el navegador.

Las llamadas a la API se mockean con `page.route()` para que los tests no dependan del estado de la base de datos. Cuando el patrón de URL coincide también con la navegación SPA, se filtra por tipo de recurso para no interceptar la carga del documento HTML.

---

## Consecuencias

### Positivas

- Tests que reflejan el comportamiento real del usuario.
- No se añaden dependencias nuevas al proyecto.
- Los tests son deterministas gracias al mocking de la API.
- Reutiliza la infraestructura Docker ya existente.

### Negativas

- Es necesario tener Docker Compose levantado para ejecutar los tests.
- Tiempo de ejecución mayor que tests unitarios.

---

## Ejecución

```
npx playwright test
```

Requiere `docker compose up` con frontend accesible en `http://localhost:5500`.
