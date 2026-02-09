import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export type ImageComparisonProps = {
  originalSrc: string
  outputSrc: string
  onDownload?: () => void
}

export function ImageComparison({ originalSrc, outputSrc, onDownload }: ImageComparisonProps) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      setSliderPos(Math.max(0, Math.min(100, x)))
    },
    []
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100
      setSliderPos(Math.max(0, Math.min(100, x)))
    },
    []
  )

  return (
    <div className="rounded-xl border border-slate-600 bg-slate-800/80 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-600">
        <span className="text-sm text-slate-400">Original | Output</span>
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-900 text-sm font-medium transition-colors"
          >
            Download output
          </button>
        )}
      </div>
      <div
        ref={containerRef}
        className="relative aspect-video bg-slate-900 select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setSliderPos(50)}
        onTouchMove={handleTouchMove}
      >
        <img
          src={originalSrc}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain"
        />
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={false}
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src={outputSrc}
            alt="Output"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </motion.div>
        <div
          className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize"
          style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-400/90 flex items-center justify-center shadow-lg">
            <span className="text-slate-900 text-xs font-bold">⟷</span>
          </div>
        </div>
      </div>
    </div>
  )
}
