import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type LogEntry = {
  id: string
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR'
  message: string
  timestamp?: number
}

export type LogsPanelProps = {
  entries: LogEntry[]
  maxEntries?: number
}

export function LogsPanel({ entries, maxEntries = 50 }: LogsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [entries.length])

  const levelColors: Record<LogEntry['level'], string> = {
    INFO: 'text-slate-300',
    SUCCESS: 'text-emerald-400',
    WARN: 'text-amber-400',
    ERROR: 'text-red-400',
  }

  return (
    <div className="h-full flex flex-col rounded-xl border border-slate-600 bg-slate-900/80 shadow-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-600 bg-slate-800/80">
        <h3 className="text-sm font-semibold text-slate-200">Logs</h3>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 min-h-0"
      >
        <AnimatePresence initial={false}>
          {entries.slice(-maxEntries).map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${levelColors[entry.level]}`}
            >
              <span className="text-slate-500">[{entry.level}]</span> {entry.message}
            </motion.div>
          ))}
        </AnimatePresence>
        {entries.length === 0 && (
          <p className="text-slate-500">No logs yet. Run inference simulation.</p>
        )}
      </div>
    </div>
  )
}
