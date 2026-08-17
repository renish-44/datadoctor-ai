import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../common/Spinner'
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

/*
 * RegisterForm — Registration form with floating labels, password strength
 *
 * Same floating-label pattern as LoginForm for visual consistency.
 * Adds: full name field, password strength indicators.
 */

interface RegisterFormProps {
  heading?: string
  subheading?: string
}

export default function RegisterForm({
  heading = 'Create your account',
  subheading = 'Get started with DataDoctor in seconds',
}: RegisterFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()

  const passwordRules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains a letter', met: /[a-zA-Z]/.test(password) },
  ]
  const allRulesMet = passwordRules.every((r) => r.met)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(email, password, fullName)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
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

      {error && (
        <div role="alert" className="flex items-start gap-2.5 p-3.5 bg-danger-50 text-danger-700 rounded-card text-xs font-medium border border-danger-200/50 animate-scale-in mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* Full name */}
        <div className="relative">
          <input
            id="reg-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder=" "
            autoComplete="name"
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
            htmlFor="reg-name"
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
            Full name
          </label>
        </div>

        {/* Email */}
        <div className="relative">
          <input
            id="reg-email"
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
            htmlFor="reg-email"
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

        {/* Password */}
        <div>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
              minLength={8}
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
              htmlFor="reg-password"
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

          {/* Password strength rules */}
          {password.length > 0 && (
            <div className="mt-2.5 space-y-1" role="list" aria-label="Password requirements">
              {passwordRules.map((rule) => (
                <div key={rule.label} className="flex items-center gap-2" role="listitem">
                  <span
                    className={`flex-shrink-0 w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                      rule.met ? 'bg-mint' : 'bg-surface-300'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-[11px] font-medium transition-colors duration-200 ${
                      rule.met ? 'text-mint-dark' : 'text-text-faint'
                    }`}
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
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
              Create account
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-text-muted">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary hover:text-primary-dark transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
