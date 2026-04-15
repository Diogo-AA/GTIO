import { test, expect } from "@playwright/test";
import { t } from "./i18n";

test("renders title and login tab active by default", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("h2")).toHaveText(t("login.titulo"));
  await expect(page.locator(".tabs button.tab.active")).toHaveText(
    t("login.iniciarSesion"),
  );
  await expect(page.locator("input#login-username")).toBeVisible();
  await expect(page.locator("input#login-password")).toBeVisible();
});

test("switches to register tab and shows register form", async ({ page }) => {
  await page.goto("/login");
  await page
    .locator(".tabs button", { hasText: t("login.crearCuenta") })
    .click();
  await expect(page.locator(".tabs button.tab.active")).toHaveText(
    t("login.crearCuenta"),
  );
  await expect(page.locator("input#reg-username")).toBeVisible();
  await expect(page.locator("input#reg-password")).toBeVisible();
  await expect(page.locator("input#reg-password2")).toBeVisible();
});

test("switching back to login tab hides register form", async ({ page }) => {
  await page.goto("/login");
  await page
    .locator(".tabs button", { hasText: t("login.crearCuenta") })
    .click();
  await page
    .locator(".tabs button", { hasText: t("login.iniciarSesion") })
    .click();
  await expect(page.locator(".tabs button.tab.active")).toHaveText(
    t("login.iniciarSesion"),
  );
  await expect(page.locator("input#login-username")).toBeVisible();
  await expect(page.locator("input#reg-username")).not.toBeVisible();
});

test("demo login redirects to /galas", async ({ page }) => {
  await page.goto("/login");
  await page.locator("button.btn-ghost", { hasText: t("login.demo") }).click();
  await expect(page).toHaveURL("/galas");
});

test("shows toast when passwords do not match on register", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .locator(".tabs button", { hasText: t("login.crearCuenta") })
    .click();
  await page.fill("input#reg-username", "testuser");
  await page.fill("input#reg-password", "password123");
  await page.fill("input#reg-password2", "differentpassword");
  await page.locator('form button[type="submit"]').click();
  await expect(page.locator(".toast-msg")).toContainText(
    t("login.contrasenasNoCoinciden"),
  );
});

test("login form has correct inputs and submit button", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("input#login-username")).toHaveAttribute(
    "type",
    "text",
  );
  await expect(page.locator("input#login-password")).toHaveAttribute(
    "type",
    "password",
  );
  await expect(page.locator('button[type="submit"]')).toHaveText(
    t("login.entrar"),
  );
});

test("shows demo info text", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator(`text=${t("login.demoInfo")}`)).toBeVisible();
});
