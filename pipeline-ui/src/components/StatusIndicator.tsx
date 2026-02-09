import { useState, useEffect } from 'react'
import { checkHealth } from '../services/api'

export function StatusIndicator() {
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    checkHealth().then((ok) => {
      if (!cancelled) setOnline(ok)
    })
    const interval = setInterval(() => {
      checkHealth().then((ok) => {
        if (!cancelled) setOnline(ok)
      })
    }, 15_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (online === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-slate-400 text-sm">
        <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
        Checking…
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium ${
        online ? 'text-emerald-400' : 'text-red-400'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'}`}
      />
      {online ? 'Online' : 'Offline'}
    </span>
  )
}
