import AuthLayout from '../components/auth/AuthLayout'
import LoginForm from '../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthLayout
      tagline={'Clean data.\nBetter decisions.'}
      subtext="Upload, audit, and clean your datasets with AI-powered insights. Transform messy data into actionable intelligence."
      proofItems={[
        '99.9% data accuracy across 10K+ datasets',
        'SOC 2 Type II compliant',
        'Trusted by data teams worldwide',
      ]}
    >
      <LoginForm />
    </AuthLayout>
  )
}
