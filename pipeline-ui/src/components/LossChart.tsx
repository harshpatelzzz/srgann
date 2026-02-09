import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export type LossDataPoint = {
  epoch: number
  generatorLoss: number
  discriminatorLoss: number
}

export type LossChartProps = {
  data: LossDataPoint[]
  title?: string
}

export function LossChart({ data, title = 'Loss vs Epoch' }: LossChartProps) {
  const chartData = useMemo(() => data, [data])

  return (
    <div className="rounded-xl border border-slate-600 bg-slate-800/80 p-4 h-[280px]">
      <h3 className="text-sm font-semibold text-slate-200 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={236}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="epoch"
            type="number"
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `E${v}`}
          />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value: unknown): [string, string] => [
              typeof value === 'number' ? value.toFixed(4) : String(value ?? ''),
              '',
            ]}
            labelFormatter={(label) => `Epoch ${label}`}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => (
              <span className="text-slate-300">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="generatorLoss"
            name="Generator Loss"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="discriminatorLoss"
            name="Discriminator Loss"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
