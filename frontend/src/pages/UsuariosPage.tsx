import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client'
import { showToast } from '../services/toastService'
import UsuarioModal from '../components/Modal'

interface Usuario {
  id: number
  username: string
}

export default function UsuariosPage() {
  const { t } = useTranslation()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  async function loadUsuarios() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<{ usuarios: Usuario[] } | Usuario[]>('usuarios')
      setUsuarios(Array.isArray(data) ? data : data.usuarios)
    } catch (err: unknown) {
      setError((err as Error).message)
      showToast(t('usuarios.errorCargar'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsuarios() }, [])

  return (
    <div className="container">
      <div className="flex-between">
        <span className="section-title" style={{ marginBottom: 0 }}>{t('usuarios.titulo')}</span>
        <button className="btn btn-ghost btn-sm" onClick={loadUsuarios}>{t('usuarios.actualizar')}</button>
      </div>

      <div className="box" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('usuarios.id')}</th>
                <th>{t('usuarios.usuario')}</th>
                <th>{t('usuarios.acciones')}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={3} className="loading-state">{t('usuarios.cargando')}</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={3} style={{ color: 'var(--red)', padding: '1rem' }}>{error}</td></tr>
              )}
              {!loading && !error && usuarios.length === 0 && (
                <tr><td colSpan={3} className="empty-state">{t('usuarios.sinUsuarios')}</td></tr>
              )}
              {!loading && !error && usuarios.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.id}</strong></td>
                  <td>{u.username}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedId(u.id)}>
                      {t('usuarios.verHistorial')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId !== null && (
        <UsuarioModal userId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}