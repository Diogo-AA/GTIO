import { useEffect, useState } from 'react'
import { setAddToastFn, type ToastType } from '../services/toastService'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  hiding: boolean
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    setAddToastFn((message, type) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type, hiding: false }])
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, hiding: true } : t))
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, 250)
      }, 3800)
    })
    return () => { setAddToastFn(null) }
  }, [])

  return (
    <div id="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}${t.hiding ? ' hiding' : ''}`}>
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  )
}