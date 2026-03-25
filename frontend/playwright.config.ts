import { defineConfig } from '@playwright/test'

const locale = process.env.TEST_LOCALE || 'es'

export default defineConfig({
  testDir: './src',
  testMatch: '**/__e2e__/*.spec.ts',
  use: {
    baseURL: 'http://localhost:5500',
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:5500',
          localStorage: [{ name: 'ot_lang', value: locale }],
        },
      ],
    },
  },
})
