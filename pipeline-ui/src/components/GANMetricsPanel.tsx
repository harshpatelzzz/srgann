import { motion } from 'framer-motion'

export type GANMetricsPanelProps = {
  epoch: number
  generatorLoss: number
  discriminatorLoss: number
  status: 'idle' | 'running' | 'paused' | 'completed'
  visible?: boolean
}

export function GANMetricsPanel({
  epoch,
  generatorLoss,
  discriminatorLoss,
  status,
  visible = true,
}: GANMetricsPanelProps) {
  if (!visible) return null

  const statusLabel = {
    idle: 'Idle',
    running: 'Running',
    paused: 'Paused',
    completed: 'Completed',
  }[status]

  const statusColor = {
    idle: 'text-slate-400',
    running: 'text-emerald-400',
    paused: 'text-amber-400',
    completed: 'text-cyan-400',
  }[status]

  return (
    <motion.div
      className="rounded-xl border border-slate-600 bg-slate-800/80 shadow-lg p-4 grid grid-cols-4 gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Epoch
        </div>
        <div className="text-lg font-semibold text-slate-200">{epoch}</div>
      </div>
      <div className="text-center border-x border-slate-600">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Generator Loss
        </div>
        <div className="text-lg font-semibold text-cyan-400">
          {generatorLoss.toFixed(4)}
        </div>
      </div>
      <div className="text-center border-r border-slate-600">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Discriminator Loss
        </div>
        <div className="text-lg font-semibold text-violet-400">
          {discriminatorLoss.toFixed(4)}
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Status
        </div>
        <div className={`text-lg font-semibold ${statusColor}`}>{statusLabel}</div>
      </div>
    </motion.div>
  )
}
