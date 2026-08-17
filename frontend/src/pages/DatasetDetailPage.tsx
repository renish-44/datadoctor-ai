import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, Wand2, BarChart3, Columns3, FileText, Hash, Database } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import api from '../services/api'
import toast from 'react-hot-toast'

interface Dataset { id: string; name: string; original_filename: string; row_count: number; column_count: number; column_names: string[]; column_types: Record<string, string>; status: string }
interface PreviewData { columns: string[]; data: Record<string, any>[]; total_rows: number }

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [auditing, setAuditing] = useState(false)

  useEffect(() => { fetchDataset() }, [id])

  const fetchDataset = async () => {
    try {
      const [d, p] = await Promise.all([api.get(`/datasets/${id}`), api.get(`/datasets/${id}/preview`)])
      setDataset(d.data); setPreview(p.data)
    } catch { toast.error('Failed to load dataset') }
    finally { setLoading(false) }
  }

  const handleRunAudit = async () => {
    setAuditing(true)
    try { await api.post(`/audit/${id}/run`); toast.success('Audit completed') }
    catch { toast.error('Audit failed') }
    finally { setAuditing(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  if (!dataset) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app/datasets" className="p-2 text-text-muted hover:text-text hover:bg-surface-100 rounded-widget transition-all duration-150">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-display font-bold text-surface-900">Dataset Not Found</h1>
      </div>
      <Card>
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-surface-100 rounded-card flex items-center justify-center mx-auto mb-3">
            <Database className="w-6 h-6 text-text-faint" />
          </div>
          <p className="text-sm font-semibold text-text-secondary">Dataset not found</p>
          <p className="text-[11px] text-text-faint mt-1">The dataset may have been deleted</p>
          <Link to="/app/datasets" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to datasets
          </Link>
        </div>
      </Card>
    </div>
  )

  const stats = [
    { label: 'Rows', value: dataset.row_count.toLocaleString(), icon: Hash, bg: 'bg-primary-ghost', color: 'text-primary' },
    { label: 'Columns', value: dataset.column_count, icon: Columns3, bg: 'bg-accent-ghost', color: 'text-accent-600' },
    { label: 'Status', value: dataset.status, icon: BarChart3, bg: 'bg-mint-ghost', color: 'text-mint-dark' },
    { label: 'Type', value: dataset.original_filename.split('.').pop()?.toUpperCase(), icon: FileText, bg: 'bg-surface-100', color: 'text-text-muted' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app/datasets" className="p-2 text-text-muted hover:text-text hover:bg-surface-100 rounded-widget transition-all duration-150">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold text-surface-900 truncate">{dataset.name}</h1>
          <p className="text-text-faint text-xs mt-0.5">{dataset.original_filename}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRunAudit} disabled={auditing} size="md">
            {auditing ? <Spinner size="sm" color="white" /> : <Play className="w-4 h-4" />}
            Run Audit
          </Button>
          <Link to={`/app/datasets/${id}/audit`}><Button variant="secondary" size="md"><BarChart3 className="w-4 h-4" /> Audit</Button></Link>
          <Link to={`/app/datasets/${id}/cleaning`}><Button variant="secondary" size="md"><Wand2 className="w-4 h-4" /> Clean</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-stagger">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 ${s.bg} rounded-widget flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="stat-label">{s.label}</p>
                <p className="stat-value text-base">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <h2 className="text-sm font-display font-bold text-surface-900 mb-4">Column Schema</h2>
        <div className="overflow-x-auto rounded-widget border border-surface-200">
          <table className="min-w-full divide-y divide-surface-200">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-text-muted uppercase tracking-wider">Column Name</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-text-muted uppercase tracking-wider">Data Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {dataset.column_names.map((col, i) => (
                <tr key={col} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-50/50'}>
                  <td className="px-4 py-2.5 text-xs font-medium text-text">{col}</td>
                  <td className="px-4 py-2.5">
                    <span className="badge badge-info text-[10px]">{dataset.column_types[col]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {preview && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-display font-bold text-surface-900">Data Preview</h2>
            <span className="text-[10px] text-text-faint font-medium">First 10 of {preview.total_rows.toLocaleString()} rows</span>
          </div>
          <div className="overflow-x-auto rounded-widget border border-surface-200">
            <table className="min-w-full divide-y divide-surface-200">
              <thead>
                <tr className="table-header">
                  {preview.columns.map(col => (
                    <th key={col} className="px-4 py-2.5 text-left text-[10px] font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {preview.data.slice(0, 10).map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-50/30'}>
                    {preview.columns.map(col => (
                      <td key={col} className="px-4 py-2 text-xs text-text-secondary max-w-[200px] truncate">
                        {row[col] !== null ? <span className="font-data">{String(row[col])}</span> : <span className="text-text-faint italic">null</span>}
                      </td>
                    ))}
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
