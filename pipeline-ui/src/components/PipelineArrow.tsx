import { motion } from 'framer-motion'

export type PipelineArrowProps = {
  active?: boolean
  direction?: 'down' | 'right'
}

export function PipelineArrow({ active = false, direction = 'right' }: PipelineArrowProps) {
  const isDown = direction === 'down'

  return (
    <motion.div
      className="flex items-center justify-center shrink-0"
      initial={{ opacity: 0.5 }}
      animate={{
        opacity: active ? 1 : 0.4,
        scale: active ? 1.05 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <svg
        width={isDown ? 24 : 32}
        height={isDown ? 32 : 24}
        viewBox={isDown ? '0 0 24 32' : '0 0 32 24'}
        fill="none"
        className={active ? 'text-cyan-400' : 'text-slate-500'}
      >
        {isDown ? (
          <path
            d="M12 4v20M12 24l-6-6M12 24l6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M4 12h20M20 12l-6-6M20 12l-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </motion.div>
  )
}
