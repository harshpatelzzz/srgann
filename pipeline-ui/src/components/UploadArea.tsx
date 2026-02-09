import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'

const MAX_SIZE_MB = 10
const ACCEPT = 'image/jpeg,image/jpg,image/png'

export type UploadAreaProps = {
  onSelect: (file: File | null) => void
  selectedFile: File | null
  disabled?: boolean
}

export function UploadArea({ onSelect, selectedFile, disabled }: UploadAreaProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback((file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      return 'Please select a JPG or PNG image.'
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File must be under ${MAX_SIZE_MB}MB.`
    }
    return null
  }, [])

  const handleFile = useCallback(
    (file: File | null) => {
      setError(null)
      if (!file) {
        onSelect(null as unknown as File)
        return
      }
      const err = validate(file)
      if (err) {
        setError(err)
        onSelect(null)
        return
      }
      onSelect(file)
    },
    [onSelect, validate]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setError(null)
      onSelect(null)
    },
    [onSelect]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled) return
      const file = e.dataTransfer.files?.[0]
      handleFile(file ?? null)
    },
    [disabled, handleFile]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      handleFile(file ?? null)
      e.target.value = ''
    },
    [handleFile]
  )

  return (
    <div className="space-y-3">
      <motion.div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative rounded-xl border-2 border-dashed p-8 text-center transition-colors
          ${dragOver && !disabled ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-600 bg-slate-800/50'}
          ${disabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}
        `}
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={onInputChange}
        />
        {selectedFile ? (
          <div className="space-y-2">
            <p className="text-slate-200 font-medium">{selectedFile.name}</p>
            <p className="text-slate-500 text-sm">
              {(selectedFile.size / 1024).toFixed(1)} KB · Click or drop to replace
            </p>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-slate-300 font-medium">Click or drag and drop</p>
            <p className="text-slate-500 text-sm">JPG or PNG, max {MAX_SIZE_MB}MB</p>
          </div>
        )}
      </motion.div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
