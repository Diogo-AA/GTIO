import { test, expect, type Page, type Route } from "@playwright/test";
import { t } from "./i18n";

const API_USUARIOS = "**/usuarios";

const mockUsuarios = [
  { id: 1, username: "alice" },
  { id: 2, username: "bob" },
];

const mockDetalle = {
  id: 1,
  username: "alice",
  votos: [
    {
      gala: { nombre: "Gala 1" },
      candidato: { nombre: "Candidato A" },
      fecha: "2026-01-15T00:00:00Z",
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

test.describe("UsuariosPage", () => {
  test("muestra lista de usuarios", async ({ page }) => {
    await page.route(
      API_USUARIOS,
      skipDocument((route) => route.fulfill({ json: mockUsuarios })),
    );
    await loginDemo(page);
    await page.goto("/usuarios");
    await expect(page.locator("tbody tr")).toHaveCount(2);
    await expect(page.locator("tbody tr").first()).toContainText("alice");
  });

  test("muestra estado vacío cuando no hay usuarios", async ({ page }) => {
    await page.route(
      API_USUARIOS,
      skipDocument((route) => route.fulfill({ json: [] })),
    );
    await loginDemo(page);
    await page.goto("/usuarios");
    await expect(page.locator(".empty-state")).toContainText(
      t("usuarios.sinUsuarios"),
    );
  });

  test("muestra error cuando falla la API", async ({ page }) => {
    await page.route(
      API_USUARIOS,
      skipDocument((route) => route.abort()),
    );
    await loginDemo(page);
    await page.goto("/usuarios");
    await expect(page.locator('tbody td[style*="red"]')).toBeVisible();
  });

  test("abre modal al clicar ver historial", async ({ page }) => {
    await page.route(
      API_USUARIOS,
      skipDocument((route) => route.fulfill({ json: mockUsuarios })),
    );
    await page.route(
      "**/usuarios/1",
      skipDocument((route) => route.fulfill({ json: mockDetalle })),
    );
    await loginDemo(page);
    await page.goto("/usuarios");
    await page
      .locator("button", { hasText: t("usuarios.verHistorial") })
      .first()
      .click();
    await expect(page.locator(".modal-overlay.open")).toBeVisible();
    await expect(page.locator(".modal h3")).toHaveText("alice");
  });

  test("cierra modal con el botón de cierre", async ({ page }) => {
    await page.route(
      API_USUARIOS,
      skipDocument((route) => route.fulfill({ json: mockUsuarios })),
    );
    await page.route(
      "**/usuarios/1",
      skipDocument((route) => route.fulfill({ json: mockDetalle })),
    );
    await loginDemo(page);
    await page.goto("/usuarios");
    await page
      .locator("button", { hasText: t("usuarios.verHistorial") })
      .first()
      .click();
    await expect(page.locator(".modal-overlay.open")).toBeVisible();
    await page.locator(".modal-close").click();
    await expect(page.locator(".modal-overlay")).not.toBeVisible();
  });

  test("cierra modal clicando en el overlay", async ({ page }) => {
    await page.route(
      API_USUARIOS,
      skipDocument((route) => route.fulfill({ json: mockUsuarios })),
    );
    await page.route(
      "**/usuarios/1",
      skipDocument((route) => route.fulfill({ json: mockDetalle })),
    );
    await loginDemo(page);
    await page.goto("/usuarios");
    await page
      .locator("button", { hasText: t("usuarios.verHistorial") })
      .first()
      .click();
    await expect(page.locator(".modal-overlay.open")).toBeVisible();
    await page.locator(".modal-overlay").click({ position: { x: 5, y: 5 } });
    await expect(page.locator(".modal-overlay")).not.toBeVisible();
  });

  test("muestra sin votos si el usuario no ha votado", async ({ page }) => {
    await page.route(
      API_USUARIOS,
      skipDocument((route) => route.fulfill({ json: mockUsuarios })),
    );
    await page.route(
      "**/usuarios/1",
      skipDocument((route) =>
        route.fulfill({ json: { id: 1, username: "alice", votos: [] } }),
      ),
    );
    await loginDemo(page);
    await page.goto("/usuarios");
    await page
      .locator("button", { hasText: t("usuarios.verHistorial") })
      .first()
      .click();
    await expect(
      page.locator(".modal p", { hasText: t("modal.sinVotos") }),
    ).toBeVisible();
  });
});
