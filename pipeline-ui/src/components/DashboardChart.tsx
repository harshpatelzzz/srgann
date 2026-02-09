import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export type DataPoint = { epoch: number; value: number }

export type DashboardChartProps = {
  data: DataPoint[]
  title: string
  dataKey?: string
  color: string
  valueLabel?: string
}

export function DashboardChart({
  data,
  title,
  dataKey = 'value',
  color,
  valueLabel = 'Value',
}: DashboardChartProps) {
  const chartData = data.map((d) => ({ epoch: d.epoch, [dataKey]: d.value }))

  return (
    <div className="rounded-xl border border-slate-600 bg-slate-800 p-4 shadow-lg h-64">
      <h3 className="text-sm font-semibold text-slate-200 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="epoch"
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
              valueLabel,
            ]}
            labelFormatter={(label) => `Epoch ${label}`}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            name={valueLabel}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
