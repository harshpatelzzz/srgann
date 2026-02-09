import { motion } from 'framer-motion'

const LAYERS = [
  { id: 'input', label: 'Input Image' },
  { id: 'conv', label: 'Conv Blocks' },
  { id: 'dense', label: 'Dense Layer' },
  { id: 'sigmoid', label: 'Sigmoid Output' },
]

export type DiscriminatorBlockProps = {
  activeLayer?: string | null
  realnessScore?: number // 0–1
  highlighted?: boolean
}

function getScoreColor(score: number): string {
  if (score >= 0.7) return 'bg-emerald-500'
  if (score >= 0.4) return 'bg-amber-500'
  return 'bg-red-500'
}

export function DiscriminatorBlock({
  activeLayer = null,
  realnessScore = 0,
  highlighted = false,
}: DiscriminatorBlockProps) {
  const scoreColor = getScoreColor(realnessScore)

  return (
    <motion.div
      className={`
        rounded-xl border-2 p-4 min-w-[180px]
        ${highlighted ? 'border-violet-400 bg-slate-800/90 shadow-violet-500/20' : 'border-slate-600 bg-slate-800/50'}
      `}
      animate={{
        boxShadow: highlighted ? '0 10px 40px -10px rgba(139, 92, 246, 0.3)' : '0 10px 30px rgba(0,0,0,0.2)',
      }}
      transition={{ duration: 0.25 }}
    >
      <div className="text-sm font-semibold text-slate-100 mb-3">Discriminator</div>
      <div className="flex flex-col gap-1.5">
        {LAYERS.map((layer, idx) => {
          const isActive = activeLayer === layer.id
          return (
            <motion.div
              key={layer.id}
              className={`
                rounded px-2 py-1.5 text-xs border
                ${isActive ? 'border-violet-400 bg-violet-500/20 text-violet-200' : 'border-slate-600 bg-slate-700/50 text-slate-400'}
              `}
              animate={{ opacity: isActive ? 1 : 0.85 }}
              transition={{ duration: 0.2 }}
            >
              {layer.label}
              {idx < LAYERS.length - 1 && (
                <span className="ml-1 text-slate-500">↓</span>
              )}
            </motion.div>
          )
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-600">
        <div className="text-xs text-slate-400 mb-1">Realness score (simulated)</div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${scoreColor}`}
            initial={false}
            animate={{ width: `${Math.min(1, Math.max(0, realnessScore)) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-0.5">
          <span>0</span>
          <span>{(realnessScore * 100).toFixed(0)}%</span>
          <span>1</span>
        </div>
      </div>
    </motion.div>
  )
}
