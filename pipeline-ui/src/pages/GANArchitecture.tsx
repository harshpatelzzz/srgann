import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GeneratorBlock, type GeneratorStage } from '../components/GeneratorBlock'
import { DiscriminatorBlock } from '../components/DiscriminatorBlock'
import { TrainingLoopArrow } from '../components/TrainingLoopArrow'
import { LossChart, type LossDataPoint } from '../components/LossChart'
import { LogsPanel, type LogEntry } from '../components/LogsPanel'
import { GANMetricsPanel } from '../components/GANMetricsPanel'

const SIMULATION_STEP_MS = 700
const LOSS_UPDATE_INTERVAL_MS = 500

const GEN_STAGES: GeneratorStage[] = ['input', 'conv', 'residual', 'upsample', 'output']
const DISC_LAYERS = ['input', 'conv', 'dense', 'sigmoid']

export function GANArchitecture() {
  const [epoch, setEpoch] = useState(0)
  const [genLoss, setGenLoss] = useState(0.8)
  const [discLoss, setDiscLoss] = useState(0.6)
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle')
  const [phase, setPhase] = useState<'generator' | 'discriminator' | 'loss' | 'update' | null>(null)
  const [genStageIndex, setGenStageIndex] = useState(-1)
  const [discLayerIndex, setDiscLayerIndex] = useState(-1)
  const [realnessScore, setRealnessScore] = useState(0)
  const [lossData, setLossData] = useState<LossDataPoint[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const logIdRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusRef = useRef(status)
  statusRef.current = status

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    logIdRef.current += 1
    setLogs((prev) => [...prev, { id: String(logIdRef.current), level, message }])
  }, [])

  const runOneStep = useCallback(() => {
    setPhase('generator')
    addLog('INFO', 'Generator forward pass')
    setGenStageIndex(0)

    const advanceGen = (i: number) => {
      if (statusRef.current !== 'running') return
      if (i >= GEN_STAGES.length) {
        setPhase('discriminator')
        addLog('INFO', 'Discriminator evaluation')
        setDiscLayerIndex(0)
        advanceDisc(0)
        return
      }
      setGenStageIndex(i)
      stepTimeoutRef.current = setTimeout(() => advanceGen(i + 1), SIMULATION_STEP_MS)
    }
    const advanceDisc = (i: number) => {
      if (statusRef.current !== 'running') return
      if (i >= DISC_LAYERS.length) {
        setRealnessScore(0.3 + Math.random() * 0.5)
        setPhase('loss')
        addLog('INFO', 'Calculating losses')
        stepTimeoutRef.current = setTimeout(() => {
          if (statusRef.current !== 'running') return
          setPhase('update')
          addLog('INFO', 'Updating weights')
          setGenStageIndex(-1)
          setDiscLayerIndex(-1)
          stepTimeoutRef.current = setTimeout(() => {
            setEpoch((e) => {
              const next = e + 1
              const newGen = Math.max(0.05, genLoss - 0.02 - Math.random() * 0.01)
              const newDisc = 0.4 + Math.random() * 0.4
              setGenLoss(newGen)
              setDiscLoss(newDisc)
              setLossData((prev) => [
                ...prev.slice(-49),
                { epoch: next, generatorLoss: newGen, discriminatorLoss: newDisc },
              ])
              addLog('SUCCESS', `Epoch ${next} completed`)
              setPhase(null)
              if (statusRef.current === 'running') {
                stepTimeoutRef.current = setTimeout(runOneStep, 800)
              }
              return next
            })
          }, SIMULATION_STEP_MS)
        }, SIMULATION_STEP_MS)
        return
      }
      setDiscLayerIndex(i)
      stepTimeoutRef.current = setTimeout(() => advanceDisc(i + 1), SIMULATION_STEP_MS)
    }
    advanceGen(0)
  }, [genLoss, addLog])

  useEffect(() => {
    if (status !== 'running') return
    intervalRef.current = setInterval(() => {
      setGenLoss((g) => Math.max(0.02, g - 0.001))
      setDiscLoss((d) => 0.4 + (d - 0.4) * 0.98 + (Math.random() - 0.5) * 0.06)
    }, LOSS_UPDATE_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [status])

  useEffect(() => {
    return () => {
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current)
    }
  }, [])

  const runSimulation = useCallback(() => {
    setStatus('running')
    setLossData((prev) => (prev.length > 0 ? prev : []))
    addLog('INFO', 'Training simulation started')
  }, [addLog])

  const pauseSimulation = useCallback(() => {
    setStatus('paused')
    addLog('INFO', 'Training paused')
  }, [addLog])

  const resetSimulation = useCallback(() => {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current)
    setStatus('idle')
    setEpoch(0)
    setGenLoss(0.8)
    setDiscLoss(0.6)
    setPhase(null)
    setGenStageIndex(-1)
    setDiscLayerIndex(-1)
    setRealnessScore(0)
    setLossData([])
    setLogs([])
  }, [])

  const generatorHighlighted = phase === 'generator' || phase === 'update'
  const discriminatorHighlighted = phase === 'discriminator' || phase === 'loss'
  const loopArrowAnimated = phase === 'update' || phase === 'loss'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-100 mb-1">
            Generator–Discriminator Architecture
          </h1>
          <p className="text-slate-400 text-sm">
            Super Resolution GAN: model architecture, data flow, and training loop
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={runSimulation}
            disabled={status === 'running'}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-900 transition-colors"
          >
            Run Training Simulation
          </button>
          <button
            onClick={pauseSimulation}
            disabled={status !== 'running'}
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
            {phase && (
              <motion.span
                key={phase}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-slate-400 text-sm ml-2"
              >
                {phase === 'generator' && 'Generator forward pass…'}
                {phase === 'discriminator' && 'Discriminator evaluation…'}
                {phase === 'loss' && 'Calculating losses…'}
                {phase === 'update' && 'Updating weights…'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* GAN Pipeline (horizontal) + details */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1 min-w-0 space-y-6">
            {/* Top: pipeline flow */}
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 shadow-xl overflow-x-auto">
              <h2 className="text-sm font-medium text-slate-400 mb-4">GAN pipeline</h2>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <div className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-xs text-slate-300">
                  Low Resolution
                </div>
                <Arrow active={phase === 'generator'} />
                <GeneratorBlock
                  activeStage={genStageIndex >= 0 ? GEN_STAGES[genStageIndex] : null}
                  highlighted={generatorHighlighted}
                />
                <Arrow active={phase === 'generator' || phase === 'discriminator'} />
                <div className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-xs text-slate-300">
                  Generated Image
                </div>
                <Arrow active={phase === 'discriminator'} />
                <DiscriminatorBlock
                  activeLayer={discLayerIndex >= 0 ? DISC_LAYERS[discLayerIndex] : null}
                  realnessScore={realnessScore}
                  highlighted={discriminatorHighlighted}
                />
                <Arrow active={phase === 'discriminator' || phase === 'loss'} />
                <div className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-xs text-slate-300">
                  Real / Fake
                </div>
                <TrainingLoopArrow animated={loopArrowAnimated} label="Feedback to Generator" />
              </div>
            </div>

            {/* Loss charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <LossChart
                data={
                  status === 'running'
                    ? [...lossData, { epoch: epoch + 1, generatorLoss: genLoss, discriminatorLoss: discLoss }]
                    : lossData
                }
                title="Generator & Discriminator Loss vs Epoch"
              />
            </div>
          </div>

          {/* Logs panel */}
          <div className="w-full lg:w-80 h-72 lg:h-[400px] shrink-0">
            <LogsPanel entries={logs} />
          </div>
        </div>

        {/* Metrics */}
        <GANMetricsPanel
          epoch={epoch}
          generatorLoss={genLoss}
          discriminatorLoss={discLoss}
          status={status}
          visible
        />
      </div>
    </div>
  )
}

function Arrow({ active }: { active?: boolean }) {
  return (
    <motion.span
      className={active ? 'text-cyan-400' : 'text-slate-500'}
      animate={{ opacity: active ? 1 : 0.6 }}
    >
      →
    </motion.span>
  )
}
