import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

type NavItem = { to: string; label: string; icon: string }

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard/overview', label: 'Overview', icon: '◉' },
  { to: '/dashboard/training', label: 'Training', icon: '▣' },
  { to: '/dashboard/inference', label: 'Inference', icon: '◇' },
  { to: '/dashboard/architecture', label: 'Architecture', icon: '⬡' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`
        fixed left-0 top-0 z-20 h-full flex flex-col
        bg-slate-900 border-r border-slate-700
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-52'}
      `}
    >
      <div className="p-4 border-b border-slate-700 shrink-0">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-semibold text-slate-200"
            >
              SRGAN Monitor
            </motion.span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={false}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600/90 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <span className="shrink-0 text-base" aria-hidden>
              {item.icon}
            </span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
