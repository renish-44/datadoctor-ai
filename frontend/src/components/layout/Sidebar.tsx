import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Database, Settings, HelpCircle, Activity } from 'lucide-react'
import ECG from '../common/ECG'

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/datasets', icon: Database, label: 'Datasets' },
]

const bottomItems = [
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help & Support' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-surface-200 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="p-5 border-b border-surface-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-card flex items-center justify-center shadow-float">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-surface-900 tracking-tight">DataDoctor</h1>
            <p className="text-[10px] text-text-muted font-medium tracking-widest uppercase">AI Platform</p>
          </div>
        </div>

        {/* Signature ECG pulse line */}
        <div className="mt-4 -mx-1 opacity-40">
          <ECG height={32} />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="px-3 pt-2 pb-2 text-[10px] font-bold text-text-faint uppercase tracking-widest">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Bottom */}
      <div className="p-3 border-t border-surface-200 space-y-0.5" role="navigation" aria-label="Account">
        {bottomItems.map((item) => (
          <button
            key={item.label}
            className="sidebar-link w-full"
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Upgrade CTA */}
      <div className="p-3 border-t border-surface-200">
        <button className="bg-primary-ghost rounded-card p-4 border border-primary/10 w-full text-left hover:bg-primary/10 transition-colors cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary">Upgrade to Pro</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">AI-powered cleaning & advanced analytics</p>
        </button>
      </div>
    </aside>
  )
}
