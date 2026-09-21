import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../common/Spinner'
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

/*
 * LoginForm — Login form with floating labels and validation
 *
 * Floating label pattern: uses Tailwind `peer` + `:placeholder-shown`
 * - Input has placeholder=" " (single space) so :placeholder-shown works
 * - Label floats up when input is focused OR has content
 *
 * Accessibility:
 * - All inputs have associated labels (via htmlFor/id)
 * - Focus-visible ring on all interactive elements
 * - Error announcements via role="alert"
 * - Password toggle has aria-label
 * - Tab order is natural (no positive tabindex)
 */

interface LoginFormProps {
  /** Where to redirect after successful login */
  redirectTo?: string
  /** Heading text above the form */
  heading?: string
  /** Subheading text */
  subheading?: string
}

export default function LoginForm({
  redirectTo = '/app',
  heading = 'Welcome back',
  subheading = 'Sign in to your account to continue',
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[1.625rem] font-display font-bold text-surface-900 tracking-[-0.01em]">
          {heading}
        </h2>
        <p className="mt-1.5 text-sm text-text-muted">{subheading}</p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 bg-danger-50 text-danger-700 rounded-card text-xs font-medium border border-danger-200/50 animate-scale-in mb-6"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* ── Email field ─────────────────────────────────────────── */}
        <div className="relative">
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            required
            autoComplete="email"
            aria-describedby={error ? 'login-error' : undefined}
            className="
              peer w-full px-4 pt-5 pb-2 bg-surface text-sm text-surface-900 font-medium
              border border-surface-200 rounded-card
              outline-none transition-all duration-150
              placeholder-transparent
              hover:border-surface-300
              focus:border-primary focus:ring-[3px] focus:ring-primary/10
            "
          />
          <label
            htmlFor="login-email"
            className="
              absolute left-4 top-3 text-sm text-text-faint font-medium
              pointer-events-none transition-all duration-150 origin-left
              peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-primary peer-focus:font-semibold
              peer-[:not(:placeholder-shown)]:top-1.5
              peer-[:not(:placeholder-shown)]:text-[11px]
              peer-[:not(:placeholder-shown)]:text-text-muted
              peer-[:not(:placeholder-shown)]:font-medium
            "
          >
            Email address
          </label>
        </div>

        {/* ── Password field ──────────────────────────────────────── */}
        <div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
              autoComplete="current-password"
              className="
                peer w-full px-4 pt-5 pb-2 pr-12 bg-surface text-sm text-surface-900 font-medium
                border border-surface-200 rounded-card
                outline-none transition-all duration-150
                placeholder-transparent
                hover:border-surface-300
                focus:border-primary focus:ring-[3px] focus:ring-primary/10
              "
            />
            <label
              htmlFor="login-password"
              className="
                absolute left-4 top-3 text-sm text-text-faint font-medium
                pointer-events-none transition-all duration-150 origin-left
                peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-primary peer-focus:font-semibold
                peer-[:not(:placeholder-shown)]:top-1.5
                peer-[:not(:placeholder-shown)]:text-[11px]
                peer-[:not(:placeholder-shown)]:text-text-muted
                peer-[:not(:placeholder-shown)]:font-medium
              "
            >
              Password
            </label>

            {/* Visibility toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                p-1.5 rounded-widget
                text-text-faint hover:text-text-muted hover:bg-surface-100
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
              "
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot password */}
          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>


        {/* ── Submit button ───────────────────────────────────────── */}
        <button
          type="submit"
          disabled={loading}
          className="
            group w-full flex items-center justify-center gap-2.5
            px-5 py-3 bg-primary text-white text-sm font-semibold
            rounded-card
            transition-all duration-150
            hover:bg-primary-dark hover:shadow-[0_0_0_3px_rgba(13,94,107,0.2)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none
          "
        >
          {loading ? (
            <Spinner size="sm" color="white" />
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* ── Footer link ─────────────────────────────────────────── */}
      <p className="mt-8 text-center text-xs text-text-muted">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-primary hover:text-primary-dark transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
        >
          Create free account
        </Link>
      </p>
    </>
  )
}
