import { Link } from 'react-router-dom'

export function DashboardInference() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-200">Inference</h2>
      <p className="text-slate-400 text-sm">
        Run model inference on images. Use the main app pipeline for upload and processing.
      </p>
      <Link
        to="/"
        className="inline-block px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
      >
        Go to Model Pipeline
      </Link>
    </div>
  )
}
