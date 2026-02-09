import { motion } from 'framer-motion'

export type PipelineBlockProps = {
  id: string
  label: string
  description?: string
  active?: boolean
  variant?: 'default' | 'generator' | 'discriminator' | 'input' | 'output'
  generatorStages?: { label: string; active?: boolean }[]
  discriminatorScore?: number // 0–1, simulated
  children?: React.ReactNode
}

export function PipelineBlock({
  label,
  description,
  active = false,
  variant = 'default',
  generatorStages,
  discriminatorScore,
  children,
}: PipelineBlockProps) {
  const isGenerator = variant === 'generator'
  const isDiscriminator = variant === 'discriminator'
  const isInput = variant === 'input'
  const isOutput = variant === 'output'

  return (
    <motion.div
      layout
      className={`
        rounded-xl border-2 p-4 min-w-[140px] max-w-[200px]
        shadow-lg transition-colors duration-300
        ${active ? 'border-cyan-400 bg-slate-800/90 shadow-cyan-500/20' : 'border-slate-600 bg-slate-800/50'}
        ${isGenerator && active ? 'ring-2 ring-cyan-400/50' : ''}
      `}
      animate={{
        scale: active ? 1.02 : 1,
        boxShadow: active ? '0 10px 40px -10px rgba(34, 211, 238, 0.3)' : '0 10px 30px rgba(0,0,0,0.2)',
      }}
      transition={{ duration: 0.25 }}
    >
      {(isInput || isOutput) && children ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-lg bg-slate-700/80 flex items-center justify-center overflow-hidden border border-slate-600">
            {children}
          </div>
          <span className="text-sm font-medium text-slate-200">{label}</span>
        </div>
      ) : (
        <>
          <div className="text-sm font-semibold text-slate-100 mb-1">{label}</div>
          {description && (
            <p className="text-xs text-slate-400 leading-tight mb-2">{description}</p>
          )}

          {isGenerator && generatorStages && (
            <div className="space-y-1.5 mt-2">
              {generatorStages.map((stage) => (
                <motion.div
                  key={stage.label}
                  className={`text-xs px-2 py-1 rounded ${stage.active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700/50 text-slate-400'}`}
                  initial={false}
                  animate={{ opacity: stage.active ? 1 : 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  {stage.label}
                </motion.div>
              ))}
            </div>
          )}

          {isDiscriminator && discriminatorScore !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Real</span>
                <span>Fake</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${discriminatorScore * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 text-center">
                Score (simulated)
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
