import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client'
import { showToast } from '../services/toastService'

interface Candidato {
  id: number
  nombre: string
  numVotos: number
}

interface Gala {
  id: number
  nombre: string
  fecha: string
  candidatos: Candidato[]
}

export default function GalasPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [galas, setGalas] = useState<Gala[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadGalas() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<{ galas: Gala[] }>('galas')
      setGalas(data.galas)
    } catch (err: unknown) {
      setError((err as Error).message)
      showToast(t('galas.errorCargar'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadGalas() }, [])

  return (
    <div className="container">
      <div className="flex-between">
        <span className="section-title" style={{ marginBottom: 0 }}>{t('galas.titulo')}</span>
        <button className="btn btn-ghost btn-sm" onClick={loadGalas}>{t('galas.actualizar')}</button>
      </div>

      <div className="box">
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>{t('galas.cargando')}</p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <h3>{t('common.error')}</h3>
            <p style={{ color: 'var(--red)' }}>{error}</p>
          </div>
        )}

        {!loading && !error && galas.length === 0 && (
          <div className="empty-state">
            <h3>{t('galas.sinGalas')}</h3>
            <p>{t('galas.sinGalasMensaje')}</p>
          </div>
        )}

        {!loading && !error && galas.map((gala, idx) => {
          const fecha = gala.fecha
            ? new Date(gala.fecha).toLocaleDateString(i18n.language, { day: '2-digit', month: 'long', year: 'numeric' })
            : ''
          const totalVotos = (gala.candidatos || []).reduce((s, c) => s + (c.numVotos || 0), 0)

          return (
            <div
              key={gala.id}
              className="gala-row"
              style={{ cursor: 'pointer', borderBottom: idx === galas.length - 1 ? 'none' : undefined }}
              onClick={() => navigate(`/galas/${gala.id}`)}
            >
              <div className="gala-row-info">
                <div className="gala-nombre">{gala.nombre}</div>
                <div className="gala-meta">
                  <span>{fecha}</span>
                  {' · '}
                  <span className="badge badge-gray">{t('galas.candidatos', { n: (gala.candidatos || []).length })}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span className="badge badge-blue">{t('galas.votos', { n: totalVotos })}</span>
                <span style={{ color: 'var(--gray-400)', fontSize: '.82rem' }}>{t('galas.verDetalle')}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}