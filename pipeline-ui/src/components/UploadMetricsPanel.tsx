import { motion } from 'framer-motion'

export type UploadMetricsPanelProps = {
  scaleFactor: number
  processingTimeSeconds: number
  resolutionBefore?: string
  resolutionAfter?: string
  visible: boolean
}

export function UploadMetricsPanel({
  scaleFactor,
  processingTimeSeconds,
  resolutionBefore = '—',
  resolutionAfter = '—',
  visible,
}: UploadMetricsPanelProps) {
  if (!visible) return null

  return (
    <motion.div
      className="grid grid-cols-3 gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-xl border border-slate-600 bg-slate-800 p-4 text-center">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Scale factor
        </div>
        <div className="text-lg font-semibold text-slate-200">{scaleFactor}×</div>
      </div>
      <div className="rounded-xl border border-slate-600 bg-slate-800 p-4 text-center">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Processing time
        </div>
        <div className="text-lg font-semibold text-cyan-400">
          {processingTimeSeconds.toFixed(2)} s
        </div>
      </div>
      <div className="rounded-xl border border-slate-600 bg-slate-800 p-4 text-center">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Resolution
        </div>
        <div className="text-sm font-medium text-slate-200">
          {resolutionBefore} → {resolutionAfter}
        </div>
      </div>
    </motion.div>
  )
}
