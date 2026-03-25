import { test, expect } from '@playwright/test'
import { t } from './i18n'

const API_GALAS = '**/galas'

const mockGalas = [
  {
    id: 1,
    nombre: 'Gala Test 1',
    fecha: '2026-01-15T00:00:00Z',
    candidatos: [{ id: 1, nombre: 'Candidato A', numVotos: 3 }, { id: 2, nombre: 'Candidato B', numVotos: 7 }],
  },
  {
    id: 2,
    nombre: 'Gala Test 2',
    fecha: '2026-02-20T00:00:00Z',
    candidatos: [],
  },
]

async function loginDemo(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.locator('button.btn-ghost', { hasText: t('login.demo') }).click()
  await page.waitForURL('/galas')
}

test('shows page title and update button', async ({ page }) => {
  await page.route(API_GALAS, route => route.fulfill({ json: mockGalas }))
  await loginDemo(page)
  await expect(page.locator('.section-title')).toContainText(t('galas.titulo'))
  await expect(page.locator('button', { hasText: t('galas.actualizar') })).toBeVisible()
})

test('shows galas list when API returns data', async ({ page }) => {
  await page.route(API_GALAS, route => route.fulfill({ json: mockGalas }))
  await loginDemo(page)
  await expect(page.locator('.gala-row')).toHaveCount(2)
  await expect(page.locator('.gala-nombre').first()).toHaveText('Gala Test 1')
})

test('shows empty state when no galas', async ({ page }) => {
  await page.route(API_GALAS, route => route.fulfill({ json: [] }))
  await loginDemo(page)
  await expect(page.locator('.empty-state h3')).toHaveText(t('galas.sinGalas'))
  await expect(page.locator('.empty-state p')).toHaveText(t('galas.sinGalasMensaje'))
})

test('shows error state when API fails', async ({ page }) => {
  await page.route(API_GALAS, route => route.abort())
  await loginDemo(page)
  await expect(page.locator('.empty-state h3')).toHaveText(t('common.error'))
})

test('shows loading state while fetching', async ({ page }) => {
  let unblock!: () => void
  const blocker = new Promise<void>(resolve => { unblock = resolve })
  await page.route(API_GALAS, async route => {
    await blocker
    await route.fulfill({ json: mockGalas })
  })
  await loginDemo(page)
  await page.waitForRequest('**/galas')
  await expect(page.locator('.loading-state p')).toHaveText(t('galas.cargando'))
  unblock()
  await expect(page.locator('.gala-row')).toHaveCount(2)
})

test('navigates to gala detail when a row is clicked', async ({ page }) => {
  await page.route(API_GALAS, route => route.fulfill({ json: mockGalas }))
  await loginDemo(page)
  await page.locator('.gala-row').first().click()
  await expect(page).toHaveURL(/\/galas\/\d+$/)
})

test('refreshes list when update button is clicked', async ({ page }) => {
  let callCount = 0
  await page.route(API_GALAS, route => {
    callCount++
    route.fulfill({ json: mockGalas })
  })
  await loginDemo(page)
  await expect(page.locator('.gala-row')).toHaveCount(2)
  await page.locator('button', { hasText: t('galas.actualizar') }).click()
  await expect(page.locator('.gala-row')).toHaveCount(2)
  expect(callCount).toBe(2)
})
