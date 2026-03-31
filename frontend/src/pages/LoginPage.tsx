import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client'
import { setSession, parseJwt } from '../auth/token'
import { showToast } from '../services/toastService'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('login')
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPassword2, setRegPassword2] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data = await apiFetch<{ accessToken: string }>('auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      })
      const claims = parseJwt(data.accessToken)
      const id = claims?.sub ? parseInt(claims.sub as string, 10) : 0
      const username = (claims?.name as string) || loginUsername
      setSession(data.accessToken, { id, username })
      showToast(t('login.bienvenido', { nombre: username }), 'success')
      navigate('/galas')
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (regPassword !== regPassword2) {
      showToast(t('login.contrasenasNoCoinciden'), 'error')
      return
    }
    try {
      await apiFetch('auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: regUsername, password: regPassword }),
      })
      showToast(t('login.cuentaCreada'), 'success')
      setTab('login')
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  async function demoLogin() {
    try {
      const data = await apiFetch<{ accessToken: string }>('auth/demo', { method: 'POST' })
      const claims = parseJwt(data.accessToken)
      const id = claims?.sub ? parseInt(claims.sub as string, 10) : 0
      const username = (claims?.name as string) || 'demo'
      setSession(data.accessToken, { id, username })
      showToast(t('login.modoDemo'), 'info')
      navigate('/galas')
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 55px)', padding: '2rem 1rem' }}>
      <div className="login-box">
        <h2>{t('login.titulo')}</h2>

        <div className="tabs">
          <button className={`tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>
            {t('login.iniciarSesion')}
          </button>
          <button className={`tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>
            {t('login.crearCuenta')}
          </button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-username">{t('login.usuario')}</label>
              <input id="login-username" type="text" placeholder={t('login.placeholderUsuario')} required minLength={3} maxLength={32} autoComplete="username" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="login-password">{t('login.contrasena')}</label>
              <input id="login-password" type="password" placeholder={t('login.placeholderContrasena')} required minLength={6} maxLength={128} autoComplete="current-password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full">{t('login.entrar')}</button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="reg-username">{t('login.usuario')}</label>
              <input id="reg-username" type="text" placeholder={t('login.placeholder632')} required minLength={3} maxLength={32} autoComplete="username" value={regUsername} onChange={e => setRegUsername(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">{t('login.contrasena')}</label>
              <input id="reg-password" type="password" placeholder={t('login.placeholderContrasenaMin')} required minLength={6} maxLength={128} autoComplete="new-password" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="reg-password2">{t('login.repetirContrasena')}</label>
              <input id="reg-password2" type="password" placeholder={t('login.placeholderRepetir')} required minLength={6} autoComplete="new-password" value={regPassword2} onChange={e => setRegPassword2(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full">{t('login.crearCuenta')}</button>
          </form>
        )}

        <hr className="divider" />
        <button className="btn btn-ghost btn-full" onClick={demoLogin}>
          {t('login.demo')}
        </button>
        <p style={{ textAlign: 'center', fontSize: '.75rem', color: '#9ca3af', marginTop: '.5rem' }}>
          {t('login.demoInfo')}
        </p>
      </div>
    </div>
  )
}