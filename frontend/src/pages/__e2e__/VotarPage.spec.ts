import { test, expect } from "@playwright/test";
import { t } from "./i18n";

const mockGala = {
  id: 1,
  nombre: "Gala Test",
  fecha: "2026-01-15T00:00:00Z",
  candidatos: [
    { id: 1, nombre: "Candidato A", numVotos: 3 },
    { id: 2, nombre: "Candidato B", numVotos: 7 },
  ],
};

function skipDocument(route: import("@playwright/test").Route) {
  if (route.request().resourceType() === "document") return route.continue();
}

async function mockAuth(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const key =
      "@@auth0spajs@@::7jmRrkifuWLtHgDzjfk0FKZF56RCnvje::https://api.ot-votacion.com::openid profile email";
    localStorage.setItem(
      key,
      JSON.stringify({
        body: {
          access_token: "fake.e30.token",
          id_token: "fake.e30.token",
          expires_in: 86400,
          token_type: "Bearer",
          scope: "openid profile email",
          decodedToken: {
            user: {
              sub: "auth0|test",
              name: "Test User",
              email: "test@test.com",
              "https://api.ot-votacion.com/roles": ["usuario"],
            },
          },
        },
        expiresAt: Math.floor(Date.now() / 1000) + 86400,
      }),
    );
  });
}

test("muestra los candidatos de la gala", async ({ page }) => {
  await mockAuth(page);
  await page.route(
    /\/galas\/1/,
    (route) => skipDocument(route) ?? route.fulfill({ json: mockGala }),
  );
  await page.goto("/galas/1");
  await expect(page.locator(".section-title").first()).toContainText(
    mockGala.nombre,
  );
  await expect(page.locator(".candidato-row")).toHaveCount(2);
});

test("muestra los resultados ordenados", async ({ page }) => {
  await mockAuth(page);
  await page.route(
    /\/galas\/1/,
    (route) => skipDocument(route) ?? route.fulfill({ json: mockGala }),
  );
  await page.goto("/galas/1");
  await expect(page.locator(".section-title").nth(1)).toContainText(
    t("votar.resultados"),
  );
});

test("muestra error cuando falla la API", async ({ page }) => {
  await mockAuth(page);
  await page.route(
    /\/galas\/1/,
    (route) => skipDocument(route) ?? route.abort(),
  );
  await page.goto("/galas/1");
  await expect(page.locator(".empty-state h3")).toContainText(
    t("common.error"),
  );
});

test("desactiva botones tras votar", async ({ page }) => {
  await mockAuth(page);
  await page.route(
    /\/galas\/1/,
    (route) => skipDocument(route) ?? route.fulfill({ json: mockGala }),
  );
  await page.route(/\/votos/, (route) =>
    route.fulfill({ status: 201, body: "" }),
  );
  await page.goto("/galas/1");
  const btn = page.locator(".candidato-row").first().locator("button");
  await btn.click();
  await expect(btn).toBeDisabled();
});
