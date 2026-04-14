import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'es', label: 'ES' },
  { code: 'eu', label: 'EU' },
  { code: 'en', label: 'EN' },
]

export default function LangSwitcher() {
  const { i18n } = useTranslation()

  function changeLang(code: string) {
    i18n.changeLanguage(code)
    localStorage.setItem('ot_lang', code)
  }

  return (
    <div style={{ display: 'flex', gap: '.25rem' }}>
      {LANGS.map(lang => (
        <button
          key={lang.code}
          className={`tab${i18n.language === lang.code ? ' active' : ''}`}
          onClick={() => changeLang(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}