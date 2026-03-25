import { Navigate, Outlet } from 'react-router-dom'
import { getToken } from '../auth/token'

export default function ProtectedRoute() {
  return getToken() ? <Outlet /> : <Navigate to="/login" replace />
}