import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import ECG from '../common/ECG'

/*
 * AuthLayout — Split-screen auth wrapper
 *
 * Left panel (hidden < lg): brand — logo, tagline, ECG pulse, proof points
 * Right panel: scrollable form area with centered content
 *
 * Mobile (< lg): single-column. Small brand header + form.
 * The left panel is purely decorative on desktop.
 */

interface AuthLayoutProps {
  children: ReactNode
  /** Brand tagline shown on the left panel */
  tagline?: string
  /** Supporting text below tagline */
  subtext?: string
  /** Items shown at the bottom of the left panel (e.g. trust badges, checklist) */
  proofItems?: string[]
}

export default function AuthLayout({
  children,
  tagline = 'Clean data.\nBetter decisions.',
  subtext = 'Upload, audit, and clean your datasets with AI-powered insights.',
  proofItems = ['Free 14-day trial', 'No credit card required', 'Cancel anytime'],
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">

      {/* ═══ Left panel — Brand (desktop only) ═══════════════════════ */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary-600 relative overflow-hidden flex-col">

        {/* Background layers */}
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="absolute inset-0 scan-grid opacity-30" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-auto pt-2">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-card flex items-center justify-center border border-white/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-display font-bold text-white">DataDoctor</span>
              <p className="text-[9px] text-white/40 font-medium tracking-[0.2em] uppercase leading-none mt-0.5">AI Platform</p>
            </div>
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <h2 className="text-[2.75rem] font-display font-bold text-white leading-[1.08] tracking-[-0.02em] whitespace-pre-line mb-5">
              {tagline}
            </h2>
            <p className="text-[15px] text-white/55 leading-relaxed mb-10">
              {subtext}
            </p>

            {/* ECG pulse line — signature element */}
            <div className="mb-10 opacity-30">
              <ECG height={48} color="rgba(255,255,255,0.6)" />
            </div>

            {/* Proof points */}
            <ul className="space-y-3" role="list">
              {proofItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-white/10 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm text-white/65 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-white/25 font-medium pt-4">
            &copy; {new Date().getFullYear()} DataDoctor
          </p>
        </div>
      </div>

      {/* ═══ Right panel — Form ═════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-surface">
        {/* Mobile brand header */}
        <div className="lg:hidden px-6 pt-6 pb-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-widget flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-surface-900 text-sm">DataDoctor</span>
          </Link>
        </div>

        {/* Form area — vertically centered on desktop, padded on mobile */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-10 lg:py-0">
          <div className="w-full max-w-[380px] animate-fade-in-up">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
