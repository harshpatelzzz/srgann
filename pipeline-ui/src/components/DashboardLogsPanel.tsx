import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type DashboardLogEntry = {
  id: string
  time: string
  level: 'INFO' | 'SUCCESS' | 'ERROR'
  message: string
}

export type DashboardLogsPanelProps = {
  entries: DashboardLogEntry[]
  onClear: () => void
}

export function DashboardLogsPanel({ entries, onClear }: DashboardLogsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [entries.length])

  const levelColors: Record<DashboardLogEntry['level'], string> = {
    INFO: 'text-slate-400',
    SUCCESS: 'text-emerald-400',
    ERROR: 'text-red-400',
  }

  return (
    <div className="h-full flex flex-col rounded-xl border border-slate-600 bg-slate-800/90 shadow-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-600 bg-slate-900/80 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-slate-200">LIVE LOGS</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          Clear
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 min-h-0"
      >
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${levelColors[entry.level]}`}
            >
              <span className="text-slate-500">[{entry.time}]</span>{' '}
              <span className="text-slate-500">[{entry.level}]</span> {entry.message}
            </motion.div>
          ))}
        </AnimatePresence>
        {entries.length === 0 && (
          <p className="text-slate-500">No logs yet.</p>
        )}
      </div>
    </div>
  )
}
