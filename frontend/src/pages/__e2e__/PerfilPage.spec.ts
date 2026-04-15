import { test, expect, type Page, type Route } from "@playwright/test";
import { t } from "./i18n";

const API_PERFIL = "**/usuarios/**";

const mockDetalle = {
  id: 1,
  username: "demo",
  votos: [
    {
      gala: { nombre: "Gala 1" },
      candidato: { nombre: "Candidato A" },
      fecha: "2026-01-15T00:00:00Z",
    },
    {
      gala: { nombre: "Gala 2" },
      candidato: { nombre: "Candidato B" },
      fecha: "2026-02-20T00:00:00Z",
    },
  ],
};

function skipDocument(handler: (route: Route) => void) {
  return (route: Route) => {
    if (route.request().resourceType() === "document") return route.continue();
    handler(route);
  };
}

async function loginDemo(page: Page) {
  await page.goto("/login");
  await page.locator("button.btn-ghost", { hasText: t("login.demo") }).click();
  await page.waitForURL("/galas");
}

test.describe("PerfilPage", () => {
  test("muestra estado de carga", async ({ page }) => {
    let unblock!: () => void;
    const blocker = new Promise<void>((resolve) => {
      unblock = resolve;
    });
    await page.route(
      API_PERFIL,
      skipDocument(async (route) => {
        await blocker;
        await route.fulfill({ json: mockDetalle });
      }),
    );
    await loginDemo(page);
    await page.goto("/perfil");
    await page.waitForRequest(API_PERFIL);
    await expect(page.locator(".loading-state p")).toHaveText(
      t("perfil.cargando"),
    );
    unblock();
    await expect(page.locator(".loading-state")).not.toBeVisible();
  });

  test("muestra historial vacío", async ({ page }) => {
    await page.route(
      API_PERFIL,
      skipDocument((route) =>
        route.fulfill({ json: { ...mockDetalle, votos: [] } }),
      ),
    );
    await loginDemo(page);
    await page.goto("/perfil");
    await expect(page.locator(".empty-state h3")).toHaveText(
      t("perfil.sinVotos"),
    );
    await expect(page.locator(".empty-state p")).toHaveText(
      t("perfil.sinVotosMensaje"),
    );
  });

  test("muestra tabla con votos", async ({ page }) => {
    await page.route(
      API_PERFIL,
      skipDocument((route) => route.fulfill({ json: mockDetalle })),
    );
    await loginDemo(page);
    await page.goto("/perfil");
    await expect(page.locator("tbody tr")).toHaveCount(2);
    await expect(page.locator("tbody tr").first()).toContainText("Gala 1");
    await expect(page.locator("tbody tr").first()).toContainText("Candidato A");
  });

  test("muestra nombre de usuario y votos emitidos", async ({ page }) => {
    await page.route(
      API_PERFIL,
      skipDocument((route) => route.fulfill({ json: mockDetalle })),
    );
    await loginDemo(page);
    await page.goto("/perfil");
    await expect(page.locator(".section-title")).toHaveText(t("perfil.titulo"));
    await expect(page.locator(".flex-between strong")).toContainText("demo");
  });

  test("cerrar sesión redirige a /login", async ({ page }) => {
    await page.route(
      API_PERFIL,
      skipDocument((route) => route.fulfill({ json: mockDetalle })),
    );
    await loginDemo(page);
    await page.goto("/perfil");
    await page.locator("button", { hasText: t("perfil.cerrarSesion") }).click();
    await expect(page).toHaveURL("/login");
  });
});
