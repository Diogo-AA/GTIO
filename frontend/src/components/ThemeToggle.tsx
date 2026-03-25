import { useState } from 'react'
import { getCurrentTheme, toggleTheme } from '../services/themeServices'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getCurrentTheme)

  function handleToggle() {
    toggleTheme()
    setTheme(getCurrentTheme())
  }

  return (
    <button className="btn btn-ghost btn-sm" onClick={handleToggle} title="Toggle theme">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}