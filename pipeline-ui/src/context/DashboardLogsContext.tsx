import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { DashboardLogEntry } from '../components/DashboardLogsPanel'

type ContextValue = {
  entries: DashboardLogEntry[]
  addLog: (level: DashboardLogEntry['level'], message: string) => void
  clearLogs: () => void
}

const DashboardLogsContext = createContext<ContextValue | null>(null)

function formatTime() {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

let logId = 0
export function DashboardLogsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<DashboardLogEntry[]>([])

  const addLog = useCallback((level: DashboardLogEntry['level'], message: string) => {
    logId += 1
    setEntries((prev) => [
      ...prev,
      { id: String(logId), time: formatTime(), level, message },
    ])
  }, [])

  const clearLogs = useCallback(() => setEntries([]), [])

  return (
    <DashboardLogsContext.Provider value={{ entries, addLog, clearLogs }}>
      {children}
    </DashboardLogsContext.Provider>
  )
}

export function useDashboardLogs(): ContextValue {
  const ctx = useContext(DashboardLogsContext)
  if (!ctx) throw new Error('useDashboardLogs must be used within DashboardLogsProvider')
  return ctx
}
