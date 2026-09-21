import ResetPasswordForm from '../components/auth/ResetPasswordForm'
import AuthLayout from '../components/auth/AuthLayout'

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      tagline={'Secure your account.\nSet a new password.'}
      subtext="Your password reset link has been verified. Choose a strong password to protect your data."
      proofItems={[
        'One-time use reset link',
        'Automatic token expiration',
        'Bank-grade bcrypt password hashing',
      ]}
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
