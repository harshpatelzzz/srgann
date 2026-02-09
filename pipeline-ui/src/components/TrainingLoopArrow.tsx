import { motion } from 'framer-motion'

export type TrainingLoopArrowProps = {
  animated?: boolean
  label?: string
}

export function TrainingLoopArrow({ animated = false, label = 'Feedback to Generator' }: TrainingLoopArrowProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center shrink-0"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: animated ? 1 : 0.6 }}
    >
      <svg
        width="80"
        height="56"
        viewBox="0 0 80 56"
        fill="none"
        className={animated ? 'text-violet-400' : 'text-slate-500'}
      >
        <defs>
          <marker
            id="loop-arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0 0 L6 3 L0 6 Z" fill="currentColor" />
          </marker>
        </defs>
        <motion.path
          d="M 76 4 L 76 28 Q 76 52 40 52 L 4 52"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd="url(#loop-arrowhead)"
          initial={{ pathLength: 0 }}
          animate={
            animated
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0.7, opacity: 0.6 }
          }
          transition={{ duration: 1, repeat: animated ? Infinity : 0, repeatDelay: 0.5 }}
        />
      </svg>
      <span className="text-xs text-slate-400 mt-0.5 max-w-[90px] text-center">
        {label}
      </span>
    </motion.div>
  )
}
