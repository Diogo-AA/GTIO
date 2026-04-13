import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './i18n'
import { initTheme } from './services/themeServices'
import { AuthProvider } from './auth/AuthContext'
import { auth0Client } from './auth/auth0Client'
import { setTokenGetter } from './api/client'

initTheme()
setTokenGetter(() => auth0Client.getTokenSilently())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
