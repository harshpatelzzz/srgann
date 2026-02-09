import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MetricsCards } from '../components/MetricsCards'
import { DashboardChart, type DataPoint } from '../components/DashboardChart'
import { useDashboardLogs } from '../context/DashboardLogsContext'

const MAX_EPOCHS = 80
const UPDATE_INTERVAL_MS = 1500

function generateInitialData(): {
  gen: DataPoint[]
  disc: DataPoint[]
  psnr: DataPoint[]
} {
  const gen: DataPoint[] = []
  const disc: DataPoint[] = []
  const psnr: DataPoint[] = []
  let g = 0.85
  let d = 0.65
  let p = 18
  for (let e = 1; e <= MAX_EPOCHS; e++) {
    g = Math.max(0.05, g - 0.008 - Math.random() * 0.004)
    d = 0.4 + (d - 0.4) * 0.98 + (Math.random() - 0.5) * 0.1
    p = Math.min(35, p + 0.15 + Math.random() * 0.1)
    gen.push({ epoch: e, value: g })
    disc.push({ epoch: e, value: d })
    psnr.push({ epoch: e, value: p })
  }
  return { gen, disc, psnr }
}

const INITIAL = generateInitialData()

export function Training() {
  const { addLog } = useDashboardLogs()
  const [epoch, setEpoch] = useState(0)
  const [genLoss, setGenLoss] = useState(0.8)
  const [discLoss, setDiscLoss] = useState(0.6)
  const [psnr, setPsnr] = useState(18)
  const [genData, setGenData] = useState<DataPoint[]>([])
  const [discData, setDiscData] = useState<DataPoint[]>([])
  const [psnrData, setPsnrData] = useState<DataPoint[]>([])
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const genLossRef = useRef(genLoss)
  const discLossRef = useRef(discLoss)
  const psnrRef = useRef(psnr)
  genLossRef.current = genLoss
  discLossRef.current = discLoss
  psnrRef.current = psnr

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setEpoch((e) => {
        const next = e + 1
        if (next > MAX_EPOCHS) {
          setRunning(false)
          addLog('SUCCESS', 'Training run completed')
          return e
        }
        const g = Math.max(0.05, genLossRef.current - 0.01 - Math.random() * 0.005)
        const d = 0.4 + (discLossRef.current - 0.4) * 0.97 + (Math.random() - 0.5) * 0.08
        const p = Math.min(35, psnrRef.current + 0.2 + Math.random() * 0.1)
        setGenLoss(g)
        setDiscLoss(d)
        setPsnr(p)
        setGenData((prev) => [...prev.slice(-99), { epoch: next, value: g }])
        setDiscData((prev) => [...prev.slice(-99), { epoch: next, value: d }])
        setPsnrData((prev) => [...prev.slice(-99), { epoch: next, value: p }])
        if (next === 1) {
          addLog('INFO', 'Loading image')
          addLog('INFO', 'Downsampling to 64x64')
        }
        if (next % 10 === 0) {
          addLog('INFO', `Running Generator (epoch ${next})`)
          addLog('INFO', 'Discriminator check')
          addLog('INFO', `Discriminator score: ${(0.7 + Math.random() * 0.25).toFixed(2)}`)
        }
        return next
      })
    }, UPDATE_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [running, addLog])

  const startTraining = useCallback(() => {
    setEpoch(0)
    setGenLoss(0.8)
    setDiscLoss(0.6)
    setPsnr(18)
    setGenData([])
    setDiscData([])
    setPsnrData([])
    setRunning(true)
    addLog('INFO', 'Training started')
  }, [addLog])

  const pauseTraining = useCallback(() => {
    setRunning(false)
    addLog('INFO', 'Training paused')
  }, [addLog])

  const resetTraining = useCallback(() => {
    setRunning(false)
    setEpoch(0)
    setGenLoss(0.8)
    setDiscLoss(0.6)
    setPsnr(18)
    setGenData(INITIAL.gen)
    setDiscData(INITIAL.disc)
    setPsnrData(INITIAL.psnr)
    addLog('INFO', 'Training reset')
  }, [addLog])

  const genChartData =
    genData.length > 0 ? genData : running ? [] : INITIAL.gen
  const discChartData =
    discData.length > 0 ? discData : running ? [] : INITIAL.disc
  const psnrChartData =
    psnrData.length > 0 ? psnrData : running ? [] : INITIAL.psnr

  return (
    <div className="space-y-6">
      <MetricsCards
        epoch={epoch}
        generatorLoss={genLoss}
        discriminatorLoss={discLoss}
        psnr={psnr}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <DashboardChart
          data={genChartData}
          title="Generator Loss vs Epoch"
          color="#a855f7"
          valueLabel="Generator Loss"
        />
        <DashboardChart
          data={discChartData}
          title="Discriminator Loss vs Epoch"
          color="#ec4899"
          valueLabel="Discriminator Loss"
        />
        <DashboardChart
          data={psnrChartData}
          title="PSNR Improvement over Epochs"
          color="#22c55e"
          valueLabel="PSNR (dB)"
        />
      </div>

      <motion.div
        className="flex flex-wrap items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <button
          type="button"
          onClick={startTraining}
          disabled={running}
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white transition-colors"
        >
          Start Training
        </button>
        <button
          type="button"
          onClick={pauseTraining}
          disabled={!running}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-900 transition-colors"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={resetTraining}
          className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 font-medium text-slate-200 transition-colors"
        >
          Reset
        </button>
      </motion.div>
    </div>
  )
}
