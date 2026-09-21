import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Spinner from '../common/Spinner'
import {
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Mail,
} from 'lucide-react'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setEmailSent(true)
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Could not process request. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Success: Email Sent Confirmation ──────────────────────────
  if (emailSent) {
    return (
      <div className="text-center py-6 animate-scale-in">
        <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-primary/20">
          <Mail className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-display font-bold text-surface-900 tracking-[-0.01em] mb-2">
          Check your email
        </h2>
        <p className="text-sm text-text-muted mb-2 leading-relaxed max-w-xs mx-auto">
          If an account exists for <span className="font-semibold text-surface-900">{email}</span>,
          we've sent a password reset link.
        </p>
        <p className="text-xs text-text-faint mb-6 leading-relaxed">
          The link expires in 15 minutes. Check your spam folder if you don't see it.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              setEmailSent(false)
              setError('')
            }}
            className="
              w-full flex items-center justify-center gap-2
              px-5 py-2.5 bg-surface text-sm font-semibold text-surface-700
              border border-surface-200 rounded-card
              transition-all duration-150
              hover:bg-surface-50 hover:border-surface-300
            "
          >
            <ArrowLeft className="w-4 h-4" />
            Try a different email
          </button>
          <Link
            to="/login"
            className="
              w-full flex items-center justify-center gap-2
              px-5 py-2.5 text-sm font-semibold text-primary
              rounded-card transition-colors duration-150
              hover:text-primary-dark
            "
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  // ── Email Input Form ──────────────────────────────────────────
  return (
    <>
      <div className="mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-card flex items-center justify-center text-primary mb-4 border border-primary/20">
          <KeyRound className="w-5 h-5" />
        </div>
        <h2 className="text-[1.625rem] font-display font-bold text-surface-900 tracking-[-0.01em]">
          Forgot password?
        </h2>
        <p className="mt-1.5 text-sm text-text-muted leading-relaxed">
          Enter the email address associated with your account and we'll send you a secure reset link.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 bg-danger-50 text-danger-700 rounded-card text-xs font-medium border border-danger-200/50 animate-scale-in mb-6"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRequestReset} noValidate className="space-y-5">
        <div className="relative">
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            required
            autoComplete="email"
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
            htmlFor="reset-email"
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

        <button
          type="submit"
          disabled={loading || !email.trim()}
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
              Continue
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-text-muted">
        Remember your password?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary hover:text-primary-dark transition-colors duration-150 focus-visible:outline-none focus-visible:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to sign in
        </Link>
      </p>
    </>
  )
}
