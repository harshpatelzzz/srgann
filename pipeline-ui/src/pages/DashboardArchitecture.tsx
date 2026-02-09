import { Link } from 'react-router-dom'

export function DashboardArchitecture() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-200">Architecture</h2>
      <p className="text-slate-400 text-sm">
        Generator–Discriminator architecture and training loop visualization.
      </p>
      <Link
        to="/gan-architecture"
        className="inline-block px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
      >
        Open GAN Architecture
      </Link>
    </div>
  )
}
