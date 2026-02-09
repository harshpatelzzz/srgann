import { Link } from 'react-router-dom'

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-200">Overview</h2>
      <p className="text-slate-400 text-sm">
        SRGAN monitoring dashboard. Use the sidebar to open Training, Inference, or Architecture.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/dashboard/training"
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
        >
          Open Training
        </Link>
        <Link
          to="/dashboard/inference"
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
        >
          Open Inference
        </Link>
        <Link
          to="/dashboard/architecture"
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
        >
          Open Architecture
        </Link>
      </div>
    </div>
  )
}
