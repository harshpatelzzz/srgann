import { motion } from 'framer-motion'

export type MetricsPanelProps = {
  processingTimeSeconds?: number
  scaleFactor?: number
  outputResolution?: string
  visible?: boolean
}

export function MetricsPanel({
  processingTimeSeconds = 0,
  scaleFactor = 4,
  outputResolution = '—',
  visible = true,
}: MetricsPanelProps) {
  if (!visible) return null

  return (
    <motion.div
      className="rounded-xl border border-slate-600 bg-slate-800/80 shadow-lg p-4 grid grid-cols-3 gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Processing Time
        </div>
        <div className="text-lg font-semibold text-cyan-400">
          {processingTimeSeconds > 0 ? `${processingTimeSeconds.toFixed(2)} s` : '—'}
        </div>
      </div>
      <div className="text-center border-x border-slate-600">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Scale Factor
        </div>
        <div className="text-lg font-semibold text-slate-200">{scaleFactor}×</div>
      </div>
      <div className="text-center">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Output Resolution
        </div>
        <div className="text-lg font-semibold text-slate-200">{outputResolution}</div>
      </div>
    </motion.div>
  )
}
