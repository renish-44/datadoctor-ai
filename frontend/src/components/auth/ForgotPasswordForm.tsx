import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Spinner from '../common/Spinner'
import {
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowLeft,
} from 'lucide-react'

export default function ForgotPasswordForm() {
  const navigate = useNavigate()
  
  // Step 1: 'request' (enter email) | Step 2: 'reset' (enter token and new password) | Step 3: 'success'
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request')
  
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Password validation rules
  const hasMinLength = newPassword.length >= 8
  const hasNumber = /\d/.test(newPassword)
  const hasLetter = /[a-zA-Z]/.test(newPassword)
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0

  // Handle Step 1: Request Reset Token
  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/forgot-password', { email: email.trim() })
      if (response.data?.reset_token) {
        setResetToken(response.data.reset_token)
      }
      setSuccessMessage(response.data?.message || 'Password reset token generated.')
      setStep('reset')
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Could not process request. Please check the email address.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle Step 2: Reset Password
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

    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/reset-password', {
        token: resetToken.trim(),
        new_password: newPassword,
      })
      setSuccessMessage(response.data?.message || 'Password has been successfully reset.')
      setStep('success')
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. The token may be expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Success Screen ────────────────────────────────────────── */}
      {step === 'success' && (
        <div className="text-center py-6 animate-scale-in">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-surface-900 tracking-[-0.01em] mb-2">
            Password Reset Complete!
          </h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            {successMessage}
          </p>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
            <Spinner size="sm" color="primary" />
            <span>Redirecting you to sign in...</span>
          </div>
        </div>
      )}

      {/* ── Step 1: Request Reset ──────────────────────────────────── */}
      {step === 'request' && (
        <>
          <div className="mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-card flex items-center justify-center text-primary mb-4 border border-primary/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-[1.625rem] font-display font-bold text-surface-900 tracking-[-0.01em]">
              Forgot password?
            </h2>
            <p className="mt-1.5 text-sm text-text-muted leading-relaxed">
              Enter the email address associated with your account and we'll generate a secure reset link.
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
      )}

      {/* ── Step 2: Set New Password ───────────────────────────────── */}
      {step === 'reset' && (
        <>
          <div className="mb-6">
            <h2 className="text-[1.625rem] font-display font-bold text-surface-900 tracking-[-0.01em]">
              Set new password
            </h2>
            <p className="mt-1.5 text-sm text-text-muted">
              Choose a secure password for <span className="font-semibold text-surface-900">{email}</span>.
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
            {/* Reset Token field (hidden or editable) */}
            <div className="relative">
              <input
                id="reset-token"
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder=" "
                required
                className="
                  peer w-full px-4 pt-5 pb-2 bg-surface text-xs text-surface-900 font-mono
                  border border-surface-200 rounded-card
                  outline-none transition-all duration-150
                  placeholder-transparent
                  hover:border-surface-300
                  focus:border-primary focus:ring-[3px] focus:ring-primary/10
                "
              />
              <label
                htmlFor="reset-token"
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
                Verification Reset Token
              </label>
            </div>

            {/* New password */}
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder=" "
                required
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
              disabled={loading || !hasMinLength || !hasNumber || !hasLetter || !passwordsMatch || !resetToken.trim()}
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

          <div className="mt-6 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStep('request')
                setError('')
              }}
              className="text-text-muted hover:text-surface-900 inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3 h-3" />
              Change email
            </button>
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-dark"
            >
              Cancel
            </Link>
          </div>
        </>
      )}
    </>
  )
}
