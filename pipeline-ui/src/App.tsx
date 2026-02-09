import { Routes, Route, NavLink } from 'react-router-dom'
import { ModelPipeline } from './pages/ModelPipeline'
import { GANArchitecture } from './pages/GANArchitecture'
import { DashboardLayout } from './layouts/DashboardLayout'
import { DashboardOverview } from './pages/DashboardOverview'
import { Training } from './pages/Training'
import { DashboardInference } from './pages/DashboardInference'
import { DashboardArchitecture } from './pages/DashboardArchitecture'
import { ImageUploadDashboard } from './pages/ImageUploadDashboard'

function App() {
  return (
    <>
      <nav className="sticky top-0 z-10 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-4 flex-wrap">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`
            }
          >
            Model Pipeline
          </NavLink>
          <NavLink
            to="/gan-architecture"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`
            }
          >
            GAN Architecture
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`
            }
          >
            Process image
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`
            }
          >
            Dashboard
          </NavLink>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<ModelPipeline />} />
        <Route path="/upload" element={<ImageUploadDashboard />} />
        <Route path="/gan-architecture" element={<GANArchitecture />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="training" element={<Training />} />
          <Route path="inference" element={<DashboardInference />} />
          <Route path="architecture" element={<DashboardArchitecture />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
