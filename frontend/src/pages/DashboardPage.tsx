import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Database, FileText, Wand2, Plus, ArrowUpRight, TrendingUp, Clock, Zap } from 'lucide-react'
import Card from '../components/common/Card'
import Spinner from '../components/common/Spinner'
import ECG from '../components/common/ECG'
import api from '../services/api'

interface DatasetStats {
  total_datasets: number
  total_audits: number
  total_cleanings: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DatasetStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/datasets/')
      const datasets = response.data
      setStats({ total_datasets: datasets.length, total_audits: 0, total_cleanings: 0 })
    } catch (error) {
      console.error('Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Datasets', value: stats?.total_datasets || 0, icon: Database, iconBg: 'bg-primary-ghost', iconColor: 'text-primary', trend: '+12%' },
    { label: 'Audits Run', value: stats?.total_audits || 0, icon: FileText, iconBg: 'bg-accent-ghost', iconColor: 'text-accent-600', trend: '+5%' },
    { label: 'Cleaning Jobs', value: stats?.total_cleanings || 0, icon: Wand2, iconBg: 'bg-mint-ghost', iconColor: 'text-mint-dark', trend: '+8%' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Dashboard</h1>
          <p className="text-text-muted mt-0.5 text-xs">Overview of your data quality platform</p>
        </div>
        <Link
          to="/app/datasets"
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Upload Dataset
        </Link>
      </div>

      {/* ECG pulse — decorative header element */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-0.5">System Status</p>
            <p className="text-sm text-text-secondary">All systems operational</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mint rounded-full animate-breathe"></div>
            <span className="text-[11px] font-semibold text-mint-dark">Healthy</span>
          </div>
        </div>
        <div className="mt-3 -mx-6 -mb-6 opacity-60">
          <ECG height={40} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-stagger">
        {statCards.map((stat) => (
          <Card key={stat.label} hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{stat.label}</p>
                <p className="text-[28px] font-display font-bold text-surface-900 mt-1 leading-tight">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.iconBg} rounded-widget flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-surface-200 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-mint-dark" />
              <span className="text-[11px] font-semibold text-mint-dark">{stat.trend}</span>
              <span className="text-[11px] text-text-faint">vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hover>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary-ghost rounded-widget flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-display font-bold text-surface-900">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            <Link
              to="/app/datasets"
              className="group flex items-center gap-3 p-3 border border-surface-200 rounded-widget hover:border-primary/20 hover:bg-primary-ghost/50 transition-all duration-150"
            >
              <div className="w-9 h-9 bg-primary-ghost rounded-widget flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Database className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-text">Manage Datasets</p>
                <p className="text-[11px] text-text-faint">View, upload, and organize data</p>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-text-faint group-hover:text-primary transition-colors" />
            </Link>
            
            <div className="flex items-center gap-3 p-3 border border-surface-200 rounded-widget opacity-50 cursor-not-allowed" title="Upload a dataset first to run an audit">
              <div className="w-9 h-9 bg-surface-100 rounded-widget flex items-center justify-center">
                <FileText className="w-4 h-4 text-text-faint" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-text">Run Audit</p>
                <p className="text-[11px] text-text-faint">Analyze dataset quality</p>
              </div>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-surface-100 rounded-widget flex items-center justify-center">
              <Clock className="w-4 h-4 text-text-muted" />
            </div>
            <h2 className="text-sm font-display font-bold text-surface-900">Recent Activity</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-widget">
              <div className="w-2 h-2 bg-mint rounded-full"></div>
              <div className="flex-1">
                <p className="text-xs font-medium text-text-secondary">Platform ready</p>
                <p className="text-[11px] text-text-faint">Upload your first dataset to get started</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
