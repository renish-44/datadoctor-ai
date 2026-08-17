import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Database } from 'lucide-react'
import { Link } from 'react-router-dom'

/*
 * HeroSection — DataDoctor landing hero
 *
 * Design decisions:
 * - Stats in a single horizontal bar with dividers (proof, not decoration)
 * - Background: dot-grid + radial teal gradient mesh (data-themed, not generic)
 * - CTA: primary teal button with glow focus ring
 * - Mobile-first: stacked on small, centered on large
 * - Semantic HTML: <section>, <hgroup>, <dl>/<dt>/<dd> for stats
 */

const stats = [
  { icon: ShieldCheck, value: '99.9%', label: 'Data Accuracy', note: 'validated across 10K+ datasets' },
  { icon: Zap,         value: '50x',  label: 'Faster Cleaning', note: 'vs manual spreadsheet workflows' },
  { icon: Database,    value: '10K+', label: 'Datasets Processed', note: 'and counting' },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface-50">

      {/* ── Background treatment ─────────────────────────────────────── */}
      {/* Dot grid — subtle coordinate/data feel */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-border) 0.8px, transparent 0.8px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Gradient mesh — soft teal glow from center */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(13, 94, 107, 0.07) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 70% 60%, rgba(42, 157, 173, 0.04) 0%, transparent 60%)
          `,
        }}
      />
      {/* Edge vignette — draws eye to center */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(250, 250, 248, 0.8) 100%)',
        }}
      />

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24">

        {/* Eyebrow */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-ghost border border-primary/10 rounded-pill text-[11px] font-semibold text-primary tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-mint rounded-full animate-breathe" />
            AI-Powered Data Quality
          </span>
        </div>

        {/* Headline + Subhead */}
        <hgroup className="text-center">
          <h1 className="font-display text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] font-bold text-surface-900 leading-[1.08] tracking-[-0.02em]">
            Clean data.
            <br />
            <span className="text-primary">Better decisions.</span>
          </h1>
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-text-muted max-w-xl mx-auto leading-relaxed">
            Upload, audit, and clean your datasets with AI-powered insights.
            Transform messy data into actionable intelligence.
          </p>
        </hgroup>

        {/* CTA */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="
              group inline-flex items-center justify-center gap-2.5
              w-full sm:w-auto px-7 py-3.5
              bg-primary text-white text-sm font-semibold
              rounded-card
              transition-all duration-150
              hover:bg-primary-dark hover:shadow-glow
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              active:scale-[0.98]
            "
          >
            Get started free
            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/login"
            className="
              inline-flex items-center justify-center gap-2
              w-full sm:w-auto px-7 py-3.5
              bg-surface text-text-secondary text-sm font-semibold
              border border-surface-200 rounded-card
              transition-all duration-150
              hover:border-primary/30 hover:text-text hover:bg-surface-50
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              active:scale-[0.98]
            "
          >
            Sign in
          </Link>
        </div>

        {/* ── Stat bar ─────────────────────────────────────────────── */}
        <div className="mt-14 sm:mt-20">
          <div
            className="
              inline-flex flex-col sm:flex-row items-center
              w-full sm:w-auto
              bg-surface border border-surface-200 rounded-card
              divide-y sm:divide-y-0 sm:divide-x divide-surface-200
              overflow-hidden
            "
          >
            {stats.map((stat, i) => (
              <dl
                key={stat.label}
                className="flex items-center gap-3 px-6 py-4 sm:py-3.5 w-full sm:w-auto"
              >
                <dt className="sr-only">{stat.label}</dt>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-ghost rounded-widget flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <dd className="flex flex-col">
                  <span className="font-mono text-lg font-semibold text-surface-900 leading-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-text-muted font-medium leading-tight">
                    {stat.label}
                  </span>
                </dd>
              </dl>
            ))}
          </div>

          {/* Trust line */}
          <p className="mt-4 text-center text-[11px] text-text-faint font-medium">
            <CheckCircle2 className="inline w-3 h-3 text-mint-dark mr-1 -mt-0.5" />
            No credit card required &middot; Free 14-day trial &middot; SOC 2 compliant
          </p>
        </div>
      </div>
    </section>
  )
}
