import { motion } from 'framer-motion'

export type GeneratorStage = 'input' | 'conv' | 'residual' | 'upsample' | 'output'

const STAGES: { id: GeneratorStage; label: string; detail: string }[] = [
  { id: 'input', label: 'Input Image', detail: '64×64' },
  { id: 'conv', label: 'Conv Layer', detail: 'Feature extraction' },
  { id: 'residual', label: 'Residual Blocks', detail: '16 blocks' },
  { id: 'upsample', label: 'Upsampling', detail: 'Pixel Shuffle' },
  { id: 'output', label: 'Output Image', detail: '256×256' },
]

export type GeneratorBlockProps = {
  activeStage?: GeneratorStage | null
  highlighted?: boolean
}

export function GeneratorBlock({ activeStage = null, highlighted = false }: GeneratorBlockProps) {
  return (
    <motion.div
      className={`
        rounded-xl border-2 p-4 min-w-[200px]
        ${highlighted ? 'border-cyan-400 bg-slate-800/90 shadow-cyan-500/20' : 'border-slate-600 bg-slate-800/50'}
      `}
      animate={{
        boxShadow: highlighted ? '0 10px 40px -10px rgba(34, 211, 238, 0.3)' : '0 10px 30px rgba(0,0,0,0.2)',
      }}
      transition={{ duration: 0.25 }}
    >
      <div className="text-sm font-semibold text-slate-100 mb-3">Generator</div>
      <div className="flex flex-col gap-2">
        {STAGES.map((stage, index) => {
          const isActive = activeStage === stage.id
          return (
            <motion.div
              key={stage.id}
              className={`
                rounded-lg px-3 py-2 text-xs border
                ${isActive ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-700/50 text-slate-400'}
              `}
              animate={{ opacity: isActive ? 1 : 0.85 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-medium">{stage.label}</div>
              <div className="text-slate-500 mt-0.5">{stage.detail}</div>
              {index < STAGES.length - 1 && (
                <div className="flex justify-center mt-1">
                  <motion.span
                    className="text-slate-500"
                    animate={{ opacity: isActive ? 1 : 0.5 }}
                  >
                    ↓
                  </motion.span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
