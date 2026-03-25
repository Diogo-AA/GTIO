import { getToken } from '../auth/token'

const API_BASE = import.meta.env.VITE_API_BASE as string

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}/${path}`, { ...options, headers })

  if (!res.ok) {
    let msg = `Error ${res.status}`
    try { const e = await res.json(); msg = e.title || e.message || msg } catch { }
    throw new Error(msg)
  }

  if (res.status === 201 || res.status === 204) return null as T
  return res.json() as Promise<T>
}