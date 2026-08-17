import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { LogOut, User, Bell, Search, ChevronDown } from 'lucide-react'

export default function TopBar() {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="h-14 bg-surface/80 backdrop-blur-sm border-b border-surface-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
          <input
            type="text"
            placeholder="Search datasets, reports..."
            className="input-field pl-9 py-2.5 text-xs"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="relative p-2 text-text-muted hover:text-text hover:bg-surface-100 rounded-widget transition-all duration-150" aria-label="Notifications">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full ring-2 ring-surface"></span>
        </button>
        
        <div className="h-5 w-px bg-surface-200 mx-1"></div>
        
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-surface-100 rounded-widget transition-all duration-150"
            aria-expanded={showDropdown}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <div className="w-7 h-7 bg-primary-600 rounded-widget flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-text leading-tight">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-text-faint font-medium">{user?.email}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-faint hidden sm:block" />
          </button>
          
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-surface border border-surface-200 shadow-elevated py-1 rounded-card z-50 animate-scale-in" role="menu" aria-label="User menu">
                <div className="px-4 py-3 border-b border-surface-100">
                  <p className="text-xs font-semibold text-text">{user?.full_name || 'User'}</p>
                  <p className="text-[10px] text-text-faint">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setShowDropdown(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-danger-600 hover:bg-danger-50 transition-colors"
                  role="menuitem"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
