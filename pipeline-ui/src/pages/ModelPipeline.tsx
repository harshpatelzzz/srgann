import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PipelineBlock } from '../components/PipelineBlock'
import { PipelineArrow } from '../components/PipelineArrow'
import { LogsPanel, type LogEntry } from '../components/LogsPanel'
import { MetricsPanel } from '../components/MetricsPanel'
import type { PipelineStepId } from '../types/pipeline'

const STEP_DELAY_MS = 600
const GENERATOR_SUBSTAGE_DELAY_MS = 400

const LOG_MESSAGES: Record<PipelineStepId, string> = {
  upload: 'Image received',
  frontend: 'Sending request to backend',
  backend: 'Request received by FastAPI',
  preprocessing: 'Preprocessing image',
  generator: 'Running generator',
  discriminator: 'Discriminator check (visual)',
  postprocessing: 'Post-processing output',
  output: 'Processing completed',
}

const STATUS_MESSAGES: Record<PipelineStepId, string> = {
  upload: 'Processing...',
  frontend: 'Processing...',
  backend: 'Processing...',
  preprocessing: 'Preprocessing...',
  generator: 'Running generator...',
  discriminator: 'Discriminator check...',
  postprocessing: 'Preparing output...',
  output: 'Complete',
}

const GENERATOR_STAGE_LABELS = ['Feature Extraction', 'Residual Blocks', 'Upsampling']

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function ModelPipeline() {
  const [activeStep, setActiveStep] = useState<PipelineStepId | null>(null)
  const [generatorSubStage, setGeneratorSubStage] = useState(0)
  const [statusText, setStatusText] = useState<string>('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [metrics, setMetrics] = useState({
    processingTimeSeconds: 0,
    scaleFactor: 4,
    outputResolution: '—',
  })
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle')
  const [discriminatorScore, setDiscriminatorScore] = useState(0)
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  const logIdRef = useRef(0)

  // Real inference
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [inferenceLoading, setInferenceLoading] = useState(false)
  const [inferenceError, setInferenceError] = useState<string | null>(null)
  const [inferenceTime, setInferenceTime] = useState<number | null>(null)

  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
  }, [])

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    logIdRef.current += 1
    setLogs((prev) => [...prev, { id: String(logIdRef.current), level, message }])
  }, [])

  const runStep = useCallback(
    (stepIndex: number) => {
      if (simulationState === 'paused') return

      const steps: PipelineStepId[] = ['upload', 'frontend', 'backend', 'preprocessing', 'generator', 'discriminator', 'postprocessing', 'output']
      if (stepIndex >= steps.length) {
        setSimulationState('completed')
        setStatusText('Complete')
        setMetrics((m) => ({ ...m, processingTimeSeconds: 2.34, outputResolution: '1024×1024' }))
        addLog('SUCCESS', 'Processing completed')
        return
      }

      const step = steps[stepIndex]
      setActiveStep(step)
      setStatusText(STATUS_MESSAGES[step])
      addLog('INFO', LOG_MESSAGES[step])

      if (step === 'generator') {
        // Animate generator sub-stages
        GENERATOR_STAGE_LABELS.forEach((_, i) => {
          const t = setTimeout(() => {
            setGeneratorSubStage((prev) => (prev <= i ? i + 1 : prev))
          }, (i + 1) * GENERATOR_SUBSTAGE_DELAY_MS)
          timeoutRefs.current.push(t)
        })
      }

      if (step === 'discriminator') {
        const t = setTimeout(() => setDiscriminatorScore(0.82), 200)
        timeoutRefs.current.push(t)
      }

      const nextT = setTimeout(() => runStep(stepIndex + 1), STEP_DELAY_MS + (step === 'generator' ? GENERATOR_STAGE_LABELS.length * GENERATOR_SUBSTAGE_DELAY_MS : 0))
      timeoutRefs.current.push(nextT)
    },
    [simulationState, addLog]
  )

  const runSimulation = useCallback(() => {
    clearTimeouts()
    setLogs([])
    setActiveStep(null)
    setGeneratorSubStage(0)
    setDiscriminatorScore(0)
    setMetrics((m) => ({ ...m, processingTimeSeconds: 0, outputResolution: '—' }))
    setSimulationState('running')
    const t = setTimeout(() => runStep(0), 300)
    timeoutRefs.current.push(t)
  }, [clearTimeouts, runStep])

  const pauseSimulation = useCallback(() => {
    clearTimeouts()
    setSimulationState('paused')
    setStatusText('Paused')
  }, [clearTimeouts])

  const resetSimulation = useCallback(() => {
    clearTimeouts()
    setActiveStep(null)
    setGeneratorSubStage(0)
    setDiscriminatorScore(0)
    setStatusText('')
    setLogs([])
    setMetrics({ processingTimeSeconds: 0, scaleFactor: 4, outputResolution: '—' })
    setSimulationState('idle')
  }, [clearTimeouts])

  useEffect(() => () => clearTimeouts(), [clearTimeouts])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setPreviewUrl(null)
    setResultUrl(null)
    setInferenceError(null)
    setInferenceTime(null)
    if (file) {
      setUploadedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setUploadedFile(null)
    }
  }, [previewUrl, resultUrl])

  const processImage = useCallback(async () => {
    if (!uploadedFile) return
    setInferenceError(null)
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setInferenceLoading(true)
    const start = performance.now()
    addLog('INFO', 'Sending image to backend...')
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      const res = await fetch(`${API_BASE}/super-resolve`, {
        method: 'POST',
        body: formData,
      })
      const elapsed = (performance.now() - start) / 1000
      setInferenceTime(elapsed)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Server error ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
      addLog('SUCCESS', `Processing completed in ${elapsed.toFixed(2)}s`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed'
      setInferenceError(msg)
      addLog('ERROR', msg)
    } finally {
      setInferenceLoading(false)
    }
  }, [uploadedFile, addLog])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-100 mb-1">
            Model Pipeline
          </h1>
          <p className="text-slate-400 text-sm">
            Image super resolution: input to output processing flow
          </p>
        </header>

        {/* Real inference: upload + process */}
        <section className="mb-8 rounded-xl border border-slate-700 bg-slate-900/50 p-6 shadow-xl">
          <h2 className="text-lg font-medium text-slate-200 mb-4">Real inference</h2>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-400">Upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="block w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-slate-900 file:font-medium file:cursor-pointer hover:file:bg-cyan-500"
              />
            </label>
            <button
              onClick={processImage}
              disabled={!uploadedFile || inferenceLoading}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-900 transition-colors"
            >
              {inferenceLoading ? 'Processing…' : 'Process image'}
            </button>
          </div>
          {inferenceError && (
            <p className="mt-3 text-sm text-red-400">{inferenceError}</p>
          )}
          {(previewUrl || resultUrl) && (
            <div className="mt-6 flex flex-wrap gap-6 items-start">
              {previewUrl && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Input</p>
                  <img
                    src={previewUrl}
                    alt="Uploaded"
                    className="max-h-64 rounded-lg border border-slate-600 object-contain bg-slate-800/50"
                  />
                </div>
              )}
              {resultUrl && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">
                    Output (original | super-resolved)
                    {inferenceTime != null && (
                      <span className="ml-2 text-cyan-400">{inferenceTime.toFixed(2)}s</span>
                    )}
                  </p>
                  <img
                    src={resultUrl}
                    alt="Result"
                    className="max-h-64 rounded-lg border border-slate-600 object-contain bg-slate-800/50"
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* Simulation controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={runSimulation}
            disabled={simulationState === 'running'}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-900 transition-colors"
          >
            Run Inference Simulation
          </button>
          <button
            onClick={pauseSimulation}
            disabled={simulationState !== 'running'}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-900 transition-colors"
          >
            Pause
          </button>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 font-medium text-slate-200 transition-colors"
          >
            Reset
          </button>
          <AnimatePresence mode="wait">
            {statusText && (
              <motion.span
                key={statusText}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-slate-400 text-sm ml-2"
              >
                {statusText}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Main content: pipeline + logs */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Pipeline */}
          <div className="flex-1 min-w-0 rounded-xl border border-slate-700 bg-slate-900/50 p-6 shadow-xl overflow-x-auto">
            <div className="flex items-stretch gap-2 justify-center flex-wrap">
              <PipelineBlock
                id="upload"
                label="Input Image"
                variant="input"
                active={activeStep === 'upload'}
              >
                <span className="text-3xl text-slate-500">📷</span>
              </PipelineBlock>
              <PipelineArrow active={activeStep === 'upload' || activeStep === 'frontend'} />
              <PipelineBlock
                id="frontend"
                label="Frontend (React)"
                description="Image uploaded and sent to backend via HTTP request"
                active={activeStep === 'frontend'}
              />
              <PipelineArrow active={activeStep === 'frontend' || activeStep === 'backend'} />
              <PipelineBlock
                id="backend"
                label="Backend API (FastAPI)"
                description="Receives image, converts to tensor, and runs model"
                active={activeStep === 'backend'}
              />
              <PipelineArrow active={activeStep === 'backend' || activeStep === 'preprocessing'} />
              <PipelineBlock
                id="preprocessing"
                label="Preprocessing"
                description="Normalize and prepare tensor"
                active={activeStep === 'preprocessing'}
              />
              <PipelineArrow active={activeStep === 'preprocessing' || activeStep === 'generator'} />
              <PipelineBlock
                id="generator"
                label="Generator Network"
                variant="generator"
                active={activeStep === 'generator'}
                generatorStages={GENERATOR_STAGE_LABELS.map((label, i) => ({
                  label,
                  active: generatorSubStage > i,
                }))}
              />
              <PipelineArrow active={activeStep === 'generator' || activeStep === 'discriminator'} />
              <PipelineBlock
                id="discriminator"
                label="Discriminator"
                description="Real / Fake (visual only)"
                variant="discriminator"
                active={activeStep === 'discriminator'}
                discriminatorScore={discriminatorScore}
              />
              <PipelineArrow active={activeStep === 'discriminator' || activeStep === 'postprocessing'} />
              <PipelineBlock
                id="postprocessing"
                label="Post-processing"
                description="Denormalize and encode output"
                active={activeStep === 'postprocessing'}
              />
              <PipelineArrow active={activeStep === 'postprocessing' || activeStep === 'output'} />
              <PipelineBlock
                id="output"
                label="Enhanced Image"
                variant="output"
                active={activeStep === 'output'}
              >
                <span className="text-3xl text-slate-500">🖼️</span>
              </PipelineBlock>
            </div>
          </div>

          {/* Logs panel */}
          <div className="w-full lg:w-80 h-64 lg:h-[320px] shrink-0">
            <LogsPanel entries={logs} />
          </div>
        </div>

        {/* Metrics */}
        <MetricsPanel
          processingTimeSeconds={metrics.processingTimeSeconds}
          scaleFactor={metrics.scaleFactor}
          outputResolution={metrics.outputResolution}
          visible={simulationState === 'completed' || metrics.processingTimeSeconds > 0}
        />
      </div>
    </div>
  )
}
