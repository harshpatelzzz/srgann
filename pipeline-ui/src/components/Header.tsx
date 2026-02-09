import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Header() {
  const [dark, setDark] = useState(true)

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-slate-700 bg-slate-900/80">
      <h1 className="text-lg font-semibold text-slate-100">
        SRGAN Technical Dashboard
      </h1>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? '☀' : '☽'}
        </button>
        <Link
          to="/"
          className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          Home
        </Link>
      </div>
    </header>
  )
}
