# ADR-0010 – Estrategia de testing del frontend

* Estado: Aceptado
* Responsables: Javier Toussent Fis, Jon Arriazu, Diogo Da Cunha, Cristian Meneses
* Fecha: 2026-03-31

---

## Contexto

El frontend React necesita una estrategia de testing que valide el comportamiento desde la perspectiva del usuario sin duplicar infraestructura de test.

---

## Opciones consideradas

| Criterio | Vitest + Testing Library | Playwright |
|---|---|---|
| Tipo | Unitario / integración de componentes | E2E en navegador real |
| Entorno | jsdom (simulado) | Chromium/Firefox/WebKit |
| Dependencias nuevas | Sí (`vitest`, `@testing-library/react`) | No (ya configurado) |
| Mocking de API | Manual por módulo | `page.route()` por URL |
| Requiere Docker | No | Sí |

---

## Decisión

**Playwright** para tests E2E.

Playwright ya está configurado en el proyecto y la infraestructura Docker Compose existe. Añadir Vitest supondría nuevas dependencias y un entorno adicional sin ganancia clara para los flujos a verificar (votación, navegación, estados de carga/error).

Las llamadas a la API se interceptan con `page.route()` para aislar el frontend del estado de la base de datos. Los textos se verifican contra las traducciones reales via el helper `i18n.ts`, evitando strings hardcodeados.

---

## Generación de tests con Groq

Los tests se generan automáticamente mediante un agente LLM (Groq) a través del script `frontend/generate-tests.mjs`. El script analiza el código fuente de cada página y genera el esqueleto de tests Playwright con los casos relevantes. Los tests generados se revisan y ajustan manualmente antes de incluirse en el repositorio.

```bash
node generate-tests.mjs
```

Requiere `GROQ_API_KEY` en `frontend/.env`.

---

## Estructura

```
frontend/src/pages/__e2e__/
├── i18n.ts               # Carga traducciones en Node.js para usar t('clave') en tests
├── GalasPage.spec.ts
├── LoginPage.spec.ts
├── PerfilPage.spec.ts
├── UsuariosPage.spec.ts
└── VotarPage.spec.ts
```

La carpeta `__e2e__` está excluida de la compilación Vite (`tsconfig.app.json`) por usar módulos Node.js.

---

## Ejecución

```bash
docker compose up -d
npx playwright test
```

Frontend accesible en `http://localhost:5500`.

---

## Consecuencias

- Tests deterministas independientes del estado de BD gracias al mocking de API.
- Sin dependencias nuevas en el proyecto.
- Requiere Docker Compose activo para ejecutar.
