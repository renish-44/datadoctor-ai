import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import Spinner from '../common/Spinner'
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react'

// Cookie helpers — store the reset token in an HttpOnly-like session cookie
// (client-side cookies since we're an SPA; the token is never rendered in the UI)
function setResetTokenCookie(token: string) {
  // Cookie expires in 15 minutes to match the token's TTL
  const expires = new Date(Date.now() + 15 * 60 * 1000).toUTCString()
  document.cookie = `reset_token=${encodeURIComponent(token)}; expires=${expires}; path=/reset-password; SameSite=Strict; Secure`
}

function getResetTokenCookie(): string {
  const match = document.cookie.match(/(^|;\s*)reset_token=([^;]*)/)
  return match ? decodeURIComponent(match[2]) : ''
}

function clearResetTokenCookie() {
  document.cookie = 'reset_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/reset-password; SameSite=Strict; Secure'
}

export default function ResetPasswordForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenMissing, setTokenMissing] = useState(false)

  // On mount: grab token from URL query param → store in cookie → clean URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setResetTokenCookie(tokenFromUrl)
      // Remove the token from the URL (replace so back-button doesn't re-expose it)
      navigate('/reset-password', { replace: true })
    } else {
      // No token in URL — check if we already have one in cookie
      const tokenFromCookie = getResetTokenCookie()
      if (!tokenFromCookie) {
        setTokenMissing(true)
      }
    }
  }, [searchParams, navigate])

  // Password validation rules
  const hasMinLength = newPassword.length >= 8
  const hasNumber = /\d/.test(newPassword)
  const hasLetter = /[a-zA-Z]/.test(newPassword)
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!hasMinLength || !hasNumber || !hasLetter) {
      setError('Please fulfill all password requirements.')
      return
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }

    const resetToken = getResetTokenCookie()
    if (!resetToken) {
      setError('Reset token has expired or is missing. Please request a new password reset link.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/reset-password', {
        token: resetToken,
        new_password: newPassword,
      })
      clearResetTokenCookie()
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success Screen ────────────────────────────────────────────
  if (success) {
    return (
      <div className="text-center py-6 animate-scale-in">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-display font-bold text-surface-900 tracking-[-0.01em] mb-2">
          Password Reset Complete!
        </h2>
        <p className="text-sm text-text-muted mb-6 leading-relaxed">
          Your password has been successfully updated. You can now sign in.
        </p>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
          <Spinner size="sm" color="primary" />
          <span>Redirecting you to sign in...</span>
        </div>
      </div>
    )
  }

  // ── No Token: Invalid Access ──────────────────────────────────
  if (tokenMissing) {
    return (
      <div className="text-center py-6 animate-scale-in">
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-display font-bold text-surface-900 tracking-[-0.01em] mb-2">
          Invalid or expired link
        </h2>
        <p className="text-sm text-text-muted mb-6 leading-relaxed max-w-xs mx-auto">
          This password reset link is missing, expired, or has already been used.
          Please request a new one.
        </p>
        <Link
          to="/forgot-password"
          className="
            inline-flex items-center justify-center gap-2
            px-6 py-2.5 bg-primary text-white text-sm font-semibold
            rounded-card transition-all duration-150
            hover:bg-primary-dark
          "
        >
          Request new link
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  // ── Reset Password Form ───────────────────────────────────────
  return (
    <>
      <div className="mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-card flex items-center justify-center text-primary mb-4 border border-primary/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h2 className="text-[1.625rem] font-display font-bold text-surface-900 tracking-[-0.01em]">
          Set new password
        </h2>
        <p className="mt-1.5 text-sm text-text-muted leading-relaxed">
          Choose a strong, secure password for your account.
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

      <form onSubmit={handleResetPassword} noValidate className="space-y-4">
        {/* New password */}
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder=" "
            required
            autoComplete="new-password"
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
            htmlFor="new-password"
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
            New password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              p-1.5 rounded-widget
              text-text-faint hover:text-text-muted hover:bg-surface-100
              transition-colors duration-150
            "
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Confirm password */}
        <div className="relative">
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder=" "
            required
            autoComplete="new-password"
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
            htmlFor="confirm-password"
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
            Confirm new password
          </label>
        </div>

        {/* Validation checklist */}
        <ul className="space-y-1.5 pt-1">
          <li className={`flex items-center gap-2 text-xs ${hasMinLength ? 'text-emerald-600' : 'text-text-faint'}`}>
            {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>At least 8 characters</span>
          </li>
          <li className={`flex items-center gap-2 text-xs ${hasNumber ? 'text-emerald-600' : 'text-text-faint'}`}>
            {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>Contains a number</span>
          </li>
          <li className={`flex items-center gap-2 text-xs ${hasLetter ? 'text-emerald-600' : 'text-text-faint'}`}>
            {hasLetter ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>Contains a letter</span>
          </li>
          {confirmPassword.length > 0 && (
            <li className={`flex items-center gap-2 text-xs ${passwordsMatch ? 'text-emerald-600' : 'text-danger-600'}`}>
              {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>Passwords match</span>
            </li>
          )}
        </ul>

        <button
          type="submit"
          disabled={loading || !hasMinLength || !hasNumber || !hasLetter || !passwordsMatch}
          className="
            group w-full flex items-center justify-center gap-2.5
            px-5 py-3 bg-primary text-white text-sm font-semibold
            rounded-card
            transition-all duration-150
            hover:bg-primary-dark hover:shadow-[0_0_0_3px_rgba(13,94,107,0.2)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none
            mt-4
          "
        >
          {loading ? (
            <Spinner size="sm" color="white" />
          ) : (
            <>
              Reset Password
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-text-muted">
        <Link
          to="/login"
          className="font-semibold text-primary hover:text-primary-dark transition-colors duration-150"
        >
          Cancel and return to sign in
        </Link>
      </p>
    </>
  )
}
