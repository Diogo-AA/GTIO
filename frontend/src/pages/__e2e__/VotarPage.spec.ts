import { test, expect, type Page, type Route } from '@playwright/test'
import { t } from './i18n'

const noVotos = { votos: [] }
const conVoto = { votos: [{ candidatoId: 1 }] }

const mockGala = {
  id: 1,
  nombre: 'Gala Test',
  fecha: '2026-01-15T00:00:00Z',
  candidatos: [
    { id: 1, nombre: 'Candidato A', numVotos: 3 },
    { id: 2, nombre: 'Candidato B', numVotos: 7 },
  ],
}

function skipDocument(handler: (route: Route) => void) {
  return (route: Route) => {
    if (route.request().resourceType() === 'document') return route.continue()
    handler(route)
  }
}

function mockGetVotos(body: object) {
  return (route: Route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ json: body })
    route.continue()
  }
}

async function loginDemo(page: Page) {
  await page.goto('/login')
  await page.locator('button.btn-ghost', { hasText: t('login.demo') }).click()
  await page.waitForURL('/galas')
}

test.describe('VotarPage', () => {
  test('muestra secciones de candidatos y resultados', async ({ page }) => {
    await page.route('**/galas/*', skipDocument(route => route.fulfill({ json: mockGala })))
    await page.route(/\/votos/, mockGetVotos(noVotos))
    await loginDemo(page)
    await page.goto('/galas/1')
    await expect(page.locator('.section-title').filter({ hasText: t('votar.candidatos') })).toBeVisible()
    await expect(page.locator('.section-title').filter({ hasText: t('votar.resultados') })).toBeVisible()
  })

  test('botón volver navega a /galas', async ({ page }) => {
    await page.route('**/galas/*', skipDocument(route => route.fulfill({ json: mockGala })))
    await page.route(/\/votos/, mockGetVotos(noVotos))
    await loginDemo(page)
    await page.goto('/galas/1')
    await page.locator('button', { hasText: t('votar.volver') }).click()
    await expect(page).toHaveURL('/galas')
  })

  test('botones Votar habilitados si el usuario no ha votado', async ({ page }) => {
    await page.route('**/galas/*', skipDocument(route => route.fulfill({ json: mockGala })))
    await page.route(/\/votos/, mockGetVotos(noVotos))
    await loginDemo(page)
    await page.goto('/galas/1')
    const votarBtn = page.locator('button.btn-primary', { hasText: t('votar.votar') }).first()
    await expect(votarBtn).toBeVisible()
    await expect(votarBtn).toBeEnabled()
  })

  test('botones Votar deshabilitados si el usuario ya votó', async ({ page }) => {
    await page.route('**/galas/*', skipDocument(route => route.fulfill({ json: mockGala })))
    await page.route(/\/votos/, mockGetVotos(conVoto))
    await loginDemo(page)
    await page.goto('/galas/1')
    await expect(page.locator('button.btn-primary').first()).toBeDisabled()
  })

  test('votar muestra toast de éxito', async ({ page }) => {
    await page.route('**/galas/*', skipDocument(route => route.fulfill({ json: mockGala })))
    await page.route(/\/votos/, (route: Route) => {
      if (route.request().method() === 'GET') return route.fulfill({ json: noVotos })
      if (route.request().method() === 'POST') return route.fulfill({ status: 201, body: '' })
      route.continue()
    })
    await loginDemo(page)
    await page.goto('/galas/1')
    await page.locator('button.btn-primary', { hasText: t('votar.votar') }).first().click()
    await expect(page.locator('.toast-msg')).toContainText(t('votar.votoRegistrado'))
  })

  test('muestra error para gala inexistente', async ({ page }) => {
    await loginDemo(page)
    await page.goto('/galas/99999')
    await expect(page.locator('.empty-state h3')).toHaveText(t('common.error'))
  })
})
