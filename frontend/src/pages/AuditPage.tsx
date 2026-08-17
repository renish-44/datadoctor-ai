import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, CheckCircle, TrendingDown, BarChart3, Info, Rows3, Columns3, ShieldAlert } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Card from '../components/common/Card'
import Spinner from '../components/common/Spinner'
import api from '../services/api'

interface AuditReport {
  id: string; report_data: {
    missing_values: { total_missing: number; columns: Record<string, { count: number; percentage: number }> }
    duplicates: { exact_duplicates: number; duplicate_percentage: number }
    statistics: { numeric: Record<string, { mean: number; median: number; std: number }>; categorical: Record<string, { unique: number; top: string }> }
  }; summary: string; row_count: number; column_count: number; issues_found: number; severity: string; created_at: string
}

export default function AuditPage() {
  const { id } = useParams<{ id: string }>()
  const [report, setReport] = useState<AuditReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchLatestReport() }, [id])

  const fetchLatestReport = async () => {
    try {
      const rr = await api.get(`/audit/${id}/reports`)
      if (rr.data.length > 0) { const r = await api.get(`/audit/reports/${rr.data[0].id}`); setReport(r.data) }
    } catch { /* no reports */ }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  if (!report) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/app/datasets/${id}`} className="p-2 text-text-muted hover:text-text hover:bg-surface-100 rounded-widget transition-all"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-display font-bold text-surface-900">Audit Report</h1>
      </div>
      <Card>
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-surface-100 rounded-card flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-text-faint" />
          </div>
          <p className="text-sm font-semibold text-text-secondary">No audit reports available</p>
          <p className="text-[11px] text-text-faint mt-1">Run an audit from the dataset page</p>
          <Link to={`/app/datasets/${id}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to dataset
          </Link>
        </div>
      </Card>
    </div>
  )

  const missingData = Object.entries(report.report_data.missing_values.columns).map(([col, data]) => ({ name: col, count: data.count, percentage: data.percentage }))

  interface SummaryStat {
    label: string
    value: string | number
    icon: any
    iconBg: string
    iconColor: string
    danger?: boolean
  }

  const summaryStats: SummaryStat[] = [
    { label: 'Total Rows', value: report.row_count.toLocaleString(), icon: Rows3, iconBg: 'bg-primary-ghost', iconColor: 'text-primary' },
    { label: 'Columns', value: report.column_count, icon: Columns3, iconBg: 'bg-accent-ghost', iconColor: 'text-accent-600' },
    { label: 'Issues', value: report.issues_found, icon: AlertTriangle, iconBg: report.issues_found > 0 ? 'bg-danger-50' : 'bg-surface-100', iconColor: report.issues_found > 0 ? 'text-danger-600' : 'text-text-muted', danger: report.issues_found > 0 },
    { label: 'Severity', value: report.severity, icon: ShieldAlert, iconBg: report.severity === 'critical' ? 'bg-danger-50' : 'bg-mint-ghost', iconColor: report.severity === 'critical' ? 'text-danger-600' : 'text-mint-dark' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/app/datasets/${id}`} className="p-2 text-text-muted hover:text-text hover:bg-surface-100 rounded-widget transition-all duration-150"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Audit Report</h1>
          <p className="text-text-faint text-xs mt-0.5">Data quality analysis results</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-stagger">
        {summaryStats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 ${s.iconBg} rounded-widget flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <div>
                <p className="stat-label">{s.label}</p>
                <p className={`stat-value text-base capitalize ${s.danger ? 'text-danger-600' : ''}`}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary-ghost rounded-widget flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold text-surface-900 mb-1">Summary</h2>
            <p className="text-xs text-text-secondary leading-relaxed">{report.summary}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-accent-ghost rounded-widget flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-accent-600" />
            </div>
            <div>
              <h2 className="text-sm font-display font-bold text-surface-900">Missing Values</h2>
              <p className="text-[10px] text-text-faint">Total: {report.report_data.missing_values.total_missing.toLocaleString()}</p>
            </div>
          </div>
          {missingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={missingData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', fontSize: '11px', boxShadow: 'var(--shadow-float)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {missingData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-primary-lighter)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10">
              <CheckCircle className="w-8 h-8 text-mint-dark mx-auto mb-2" />
              <p className="text-text-muted text-xs font-medium">No missing values</p>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-danger-50 rounded-widget flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-danger-600" />
            </div>
            <div>
              <h2 className="text-sm font-display font-bold text-surface-900">Duplicates</h2>
              <p className="text-[10px] text-text-faint">Duplicate row analysis</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-surface-50 rounded-widget p-4">
              <p className="text-[10px] text-text-faint font-bold uppercase tracking-wider mb-1">Exact Duplicates</p>
              <p className="text-[28px] font-display font-bold text-surface-900">{report.report_data.duplicates.exact_duplicates.toLocaleString()}</p>
            </div>
            <div className="bg-surface-50 rounded-widget p-4">
              <p className="text-[10px] text-text-faint font-bold uppercase tracking-wider mb-1">Percentage</p>
              <p className="text-[28px] font-display font-bold text-surface-900">{report.report_data.duplicates.duplicate_percentage}%</p>
              <div className="mt-2 w-full bg-surface-200 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(report.report_data.duplicates.duplicate_percentage, 100)}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {Object.keys(report.report_data.statistics.numeric).length > 0 && (
        <Card>
          <h2 className="text-sm font-display font-bold text-surface-900 mb-4">Column Statistics</h2>
          <div className="overflow-x-auto rounded-widget border border-surface-200">
            <table className="min-w-full divide-y divide-surface-200">
              <thead>
                <tr className="table-header">
                  {['Column', 'Mean', 'Median', 'Std Dev'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {Object.entries(report.report_data.statistics.numeric).map(([col, st], i) => (
                  <tr key={col} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-50/50'}>
                    <td className="px-4 py-2.5 text-xs font-medium text-text">{col}</td>
                    <td className="px-4 py-2.5 text-xs font-data text-text-secondary">{typeof st.mean === 'number' ? st.mean.toFixed(2) : st.mean}</td>
                    <td className="px-4 py-2.5 text-xs font-data text-text-secondary">{typeof st.median === 'number' ? st.median.toFixed(2) : st.median}</td>
                    <td className="px-4 py-2.5 text-xs font-data text-text-secondary">{typeof st.std === 'number' ? st.std.toFixed(2) : st.std}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
