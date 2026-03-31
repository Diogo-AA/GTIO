import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client'
import { getUser, clearSession } from '../auth/token'
import { showToast } from '../services/toastService'

interface Voto {
  gala?: { nombre?: string }
  candidato?: { nombre?: string }
  fecha?: string
}

interface UsuarioDetalle {
  id: number
  username: string
  votos: Voto[]
}

export default function PerfilPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const user = getUser()

  const [detalle, setDetalle] = useState<UsuarioDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        const data = await apiFetch<UsuarioDetalle>(`usuarios/${user.id}`)
        setDetalle(data)
      } catch (err: unknown) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function logout() {
    clearSession()
    navigate('/login')
    showToast(t('perfil.sesionCerrada'), 'info')
  }

  return (
    <div className="container">
      <div className="flex-between">
        <div>
          <div className="section-title" style={{ marginBottom: '.15rem' }}>{t('perfil.titulo')}</div>
          <div style={{ fontSize: '.83rem', color: 'var(--gray-400)' }}>
            {t('perfil.conectadoComo')} <strong>{detalle?.username ?? user?.username}</strong>
            {' · '}
            {t('perfil.votosEmitidos', { n: detalle?.votos.length ?? 0 })}
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={logout}>{t('perfil.cerrarSesion')}</button>
      </div>

      <div className="box" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <strong>{t('perfil.historial')}</strong>
        </div>

        <div style={{ padding: '1rem' }}>
          {loading && (
            <div className="loading-state"><div className="spinner" /><p>{t('perfil.cargando')}</p></div>
          )}

          {!loading && error && (
            <p style={{ color: 'var(--red)' }}>{error}</p>
          )}

          {!loading && !error && detalle && detalle.votos.length === 0 && (
            <div className="empty-state">
              <h3>{t('perfil.sinVotos')}</h3>
              <p>{t('perfil.sinVotosMensaje')}</p>
            </div>
          )}

          {!loading && !error && detalle && detalle.votos.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('perfil.gala')}</th>
                    <th>{t('perfil.candidato')}</th>
                    <th>{t('perfil.fechaVoto')}</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.votos.map((v, idx) => (
                    <tr key={idx}>
                      <td>{v.gala?.nombre || ''}</td>
                      <td>{v.candidato?.nombre || ''}</td>
                      <td>{v.fecha ? new Date(v.fecha).toLocaleDateString(i18n.language) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}