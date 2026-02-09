import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type UploadLogEntry = {
  id: string
  level: 'INFO' | 'SUCCESS' | 'ERROR'
  message: string
}

export type UploadLogsPanelProps = {
  entries: UploadLogEntry[]
}

export function UploadLogsPanel({ entries }: UploadLogsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [entries.length])

  const levelColors: Record<UploadLogEntry['level'], string> = {
    INFO: 'text-slate-400',
    SUCCESS: 'text-emerald-400',
    ERROR: 'text-red-400',
  }

  return (
    <div className="rounded-xl border border-slate-600 bg-slate-800/80 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-600">
        <h3 className="text-sm font-semibold text-slate-200">Logs</h3>
      </div>
      <div
        ref={scrollRef}
        className="max-h-40 overflow-y-auto p-3 font-mono text-xs space-y-1"
      >
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              className={levelColors[entry.level]}
            >
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
