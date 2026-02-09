import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { DashboardLogsPanel } from '../components/DashboardLogsPanel'
import { DashboardLogsProvider, useDashboardLogs } from '../context/DashboardLogsContext'

function DashboardLayoutInner() {
  const { entries, clearLogs } = useDashboardLogs()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-52">
        <Header />
        <div className="flex-1 flex min-h-0">
          <main className="flex-1 overflow-y-auto p-6 min-w-0">
            <Outlet />
          </main>
          <aside className="w-80 shrink-0 border-l border-slate-700 p-4 flex flex-col min-h-0">
            <DashboardLogsPanel entries={entries} onClear={clearLogs} />
          </aside>
        </div>
      </div>
    </div>
  )
}

export function DashboardLayout() {
  return (
    <DashboardLogsProvider>
      <DashboardLayoutInner />
    </DashboardLogsProvider>
  )
}
