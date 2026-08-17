import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../common/Spinner'
import ECG from '../common/ECG'
import { Activity } from 'lucide-react'

interface ProtectedRouteProps { children: ReactNode }

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-50">
        <div className="text-center">
          <div className="w-10 h-10 bg-primary-600 rounded-card flex items-center justify-center mx-auto mb-4 shadow-float">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="opacity-40"><ECG height={24} /></div>
          <Spinner size="sm" className="mt-3" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
