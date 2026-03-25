import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

type Translations = Record<string, unknown>

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadLocale(locale: string): Translations {
  const file = join(__dirname, `../../i18n/locales/${locale}.json`)
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export const locale = process.env.TEST_LOCALE || 'es'

const translations = loadLocale(locale)

export function t(key: string, vars?: Record<string, string>): string {
  const parts = key.split('.')
  let node: unknown = translations
  for (const part of parts) {
    node = (node as Translations)?.[part]
  }
  let result = typeof node === 'string' ? node : key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      result = result.replace(`{{${k}}}`, v)
    }
  }
  return result
}
