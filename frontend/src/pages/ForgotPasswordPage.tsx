import AuthLayout from '../components/auth/AuthLayout'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      tagline={'Regain access.\nProtect your data.'}
      subtext="Reset your password securely with end-to-end token verification and immediate account recovery."
      proofItems={[
        'Cryptographically signed tokens',
        'Automatic token expiration',
        'Bank-grade bcrypt password hashing',
      ]}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
