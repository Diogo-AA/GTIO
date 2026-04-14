import { useEffect, useRef, useState } from 'react'
import { setAddToastFn, type ToastType } from '../services/toastService'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  hiding: boolean
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    setAddToastFn((message, type) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type, hiding: false }])
      const t1 = setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, hiding: true } : t))
        const t2 = setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, 250)
        timers.current.push(t2)
      }, 3800)
      timers.current.push(t1)
    })
    return () => {
      setAddToastFn(null)
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
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