export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'ot_theme'

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getSavedTheme(): Theme | null {
  return localStorage.getItem(STORAGE_KEY) as Theme | null
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(STORAGE_KEY, theme)
}

export function initTheme() {
  const theme = getSavedTheme() ?? getSystemTheme()
  applyTheme(theme)
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') as Theme
  applyTheme(current === 'dark' ? 'light' : 'dark')
}

export function getCurrentTheme(): Theme {
  return (document.documentElement.getAttribute('data-theme') as Theme) ?? getSystemTheme()
}