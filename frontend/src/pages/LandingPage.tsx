import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import HeroSection from '../components/sections/HeroSection'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      {/* Minimal nav */}
      <nav className="relative z-20 flex items-center justify-between px-5 sm:px-8 py-4" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-widget flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-surface-900 text-sm">DataDoctor</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-semibold text-text-muted hover:text-text transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-xs font-semibold text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-card transition-all duration-150 hover:shadow-glow"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <HeroSection />

      {/* Footer */}
      <footer className="border-t border-surface-200 py-8 px-5 sm:px-8" aria-label="Site footer">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-text-faint font-medium">
            &copy; {new Date().getFullYear()} DataDoctor. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-text-faint font-medium cursor-default">Privacy</span>
            <span className="text-[11px] text-text-faint font-medium cursor-default">Terms</span>
            <span className="text-[11px] text-text-faint font-medium cursor-default">Docs</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
