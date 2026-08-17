import AuthLayout from '../components/auth/AuthLayout'
import RegisterForm from '../components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthLayout
      tagline={'Start cleaning\nyour data today.'}
      subtext="Join thousands of data teams using DataDoctor to ensure data quality and accelerate their workflows."
      proofItems={[
        'AI-powered data cleaning',
        'Real-time quality monitoring',
        'Works with CSV, Excel, and JSON',
      ]}
    >
      <RegisterForm />
    </AuthLayout>
  )
}
