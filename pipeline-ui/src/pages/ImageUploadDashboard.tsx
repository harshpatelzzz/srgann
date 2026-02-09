import { useState, useCallback, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { StatusIndicator } from '../components/StatusIndicator'
import { UploadArea } from '../components/UploadArea'
import { ProcessingSteps } from '../components/ProcessingSteps'
import { ImageComparison } from '../components/ImageComparison'
import { UploadMetricsPanel } from '../components/UploadMetricsPanel'
import { UploadLogsPanel, type UploadLogEntry } from '../components/UploadLogsPanel'
import { enhanceImage } from '../services/api'

let logId = 0
function createLog(level: UploadLogEntry['level'], message: string): UploadLogEntry {
  logId += 1
  return { id: String(logId), level, message }
}

export function ImageUploadDashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [scale, setScale] = useState<2 | 4>(4)
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<{
    scaleFactor: number
    time: number
    resolutionBefore: string
    resolutionAfter: string
  } | null>(null)
  const [logs, setLogs] = useState<UploadLogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const outputUrlRef = useRef<string | null>(null)

  const addLog = useCallback((level: UploadLogEntry['level'], message: string) => {
    setLogs((prev) => [...prev, createLog(level, message)])
  }, [])

  const handleFileSelect = useCallback((f: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setOutputUrl((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
    outputUrlRef.current = null
    setMetrics(null)
    setError(null)
    setFile(f)
    if (f) setPreviewUrl(URL.createObjectURL(f))
  }, [previewUrl])

  const processImage = useCallback(async () => {
    if (!file) return
    setError(null)
    setProcessing(true)
    setProcessingStep(0)
    addLog('INFO', 'Image selected')
    addLog('INFO', 'Sending request to backend')

    const stepInterval = setInterval(() => {
      setProcessingStep((s) => Math.min(2, s + 1))
    }, 600)

    try {
      setProcessingStep(1)
      addLog('INFO', 'Processing started')
      const res = await enhanceImage(file, scale)
      clearInterval(stepInterval)
      setProcessingStep(2)
      const dataUrl = `data:image/png;base64,${res.output_image}`
      setOutputUrl(dataUrl)
      outputUrlRef.current = dataUrl
      const before = previewUrl ? `${file.name}` : '—'
      const after = res.output_image ? `${res.scale * 100}%` : '—'
      setMetrics({
        scaleFactor: res.scale,
        time: res.time,
        resolutionBefore: before,
        resolutionAfter: after,
      })
      addLog('SUCCESS', 'Processing completed')
    } catch (err: unknown) {
      clearInterval(stepInterval)
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Request failed'
      setError(message)
      addLog('ERROR', message)
    } finally {
      setProcessing(false)
      setProcessingStep(0)
    }
  }, [file, scale, previewUrl, addLog])

  const handleDownload = useCallback(() => {
    const url = outputUrlRef.current
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.png'
    a.click()
  }, [])

  const resolutionAfter = metrics ? `${metrics.scaleFactor}× upscaled` : '—'
  const resolutionBefore = file?.name ?? '—'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">
                Image Super Resolution
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Upload an image to improve resolution
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Large images are resized for faster processing.
              </p>
            </div>
            <StatusIndicator />
          </div>
        </header>

        {/* Upload */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-slate-400 mb-2">Upload</h2>
          <UploadArea
            selectedFile={file}
            onSelect={handleFileSelect}
            disabled={processing}
          />
          {previewUrl && (
            <div className="mt-3 rounded-lg border border-slate-600 overflow-hidden max-h-48 w-fit">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 object-contain"
              />
            </div>
          )}
        </section>

        {/* Controls */}
        <section className="mb-6 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Scale factor</span>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value) as 2 | 4)}
              disabled={processing}
              className="rounded-lg border border-slate-600 bg-slate-800 text-slate-200 px-3 py-2 text-sm"
            >
              <option value={2}>2×</option>
              <option value={4}>4×</option>
            </select>
          </label>
          <button
            type="button"
            onClick={processImage}
            disabled={!file || processing}
            className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-900 transition-colors"
          >
            {processing ? 'Processing…' : 'Process image'}
          </button>
        </section>

        {/* Processing steps */}
        <AnimatePresence>
          {processing && (
            <section className="mb-6">
              <ProcessingSteps activeStep={processingStep} visible={processing} />
            </section>
          )}
        </AnimatePresence>

        {error && (
          <p className="mb-4 text-sm text-red-400">{error}</p>
        )}

        {/* Result */}
        {previewUrl && outputUrl && (
          <section className="mb-6">
            <h2 className="text-sm font-medium text-slate-400 mb-2">Result</h2>
            <ImageComparison
              originalSrc={previewUrl}
              outputSrc={outputUrl}
              onDownload={handleDownload}
            />
          </section>
        )}

        {/* Metrics */}
        {metrics && (
          <section className="mb-6">
            <UploadMetricsPanel
              scaleFactor={metrics.scaleFactor}
              processingTimeSeconds={metrics.time}
              resolutionBefore={resolutionBefore}
              resolutionAfter={resolutionAfter}
              visible
            />
          </section>
        )}

        {/* Logs */}
        <section>
          <UploadLogsPanel entries={logs} />
        </section>
      </div>
    </div>
  )
}
