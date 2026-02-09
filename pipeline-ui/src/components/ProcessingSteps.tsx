import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { id: 'upload', label: 'Uploading image' },
  { id: 'process', label: 'Running model…' },
  { id: 'output', label: 'Preparing output (30–60 s on CPU)' },
]

export type ProcessingStepsProps = {
  activeStep: number
  visible: boolean
}

export function ProcessingSteps({ activeStep, visible }: ProcessingStepsProps) {
  if (!visible) return null

  return (
    <motion.div
      className="rounded-xl border border-slate-600 bg-slate-800/80 p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="space-y-2">
        {STEPS.map((step, index) => {
          const isActive = index === activeStep
          const isDone = index < activeStep
          return (
            <motion.div
              key={step.id}
              className={`flex items-center gap-3 text-sm ${
                isActive ? 'text-cyan-400 font-medium' : isDone ? 'text-slate-400' : 'text-slate-500'
              }`}
              initial={false}
              animate={{ opacity: isActive ? 1 : isDone ? 0.8 : 0.5 }}
            >
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isActive ? 'border-cyan-400' : isDone ? 'border-emerald-500' : 'border-slate-600'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-emerald-400"
                    >
                      ✓
                    </motion.span>
                  ) : isActive ? (
                    <motion.span
                      key="dot"
                      className="w-2 h-2 rounded-full bg-cyan-400"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  ) : (
                    <span key="empty" className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                </AnimatePresence>
              </span>
              {step.label}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
