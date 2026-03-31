import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getUser, clearSession } from '../auth/token'
import { showToast } from '../services/toastService'
import LangSwitcher from './LangSwitcher'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { path: '/galas', label: 'nav.galas' },
  { path: '/usuarios', label: 'nav.usuarios' },
  { path: '/perfil', label: 'nav.perfil' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()
  const { t } = useTranslation()

  function logout() {
    clearSession()
    navigate('/login')
    showToast(t('perfil.sesionCerrada'), 'info')
  }

  return (
    <nav>
      <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => navigate(user ? '/galas' : '/login')}>
        {t('nav.brand')}
      </div>

      {user && (
        <div className="nav-links">
          {NAV_LINKS.map(link => (
            <button
              key={link.path}
              className={`tab${location.pathname.startsWith(link.path) ? ' active' : ''}`}
              onClick={() => navigate(link.path)}
            >
              {t(link.label)}
            </button>
          ))}
        </div>
      )}

      <div id="nav-actions">
        <LangSwitcher />
        <ThemeToggle />
        {user ? (
          <>
            <div className="user-chip">
              <div className="av">{user.username.slice(0, 2).toUpperCase()}</div>
              <span>{user.username}</span>
            </div>
            <span className="estado-chip">{t('nav.conectado')}</span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>{t('nav.salir')}</button>
          </>
        ) : (
          <>
            <span className="estado-chip offline">{t('nav.desconectado')}</span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
              {t('nav.iniciarSesion')}
            </button>
          </>
        )}
      </div>
    </nav>
  )
}