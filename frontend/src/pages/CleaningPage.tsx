import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, History, RotateCcw, Wand2, X, CheckCircle2, CircleDot, Copy, TrendingUp, BarChart3, Trash2 } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import api from '../services/api'
import toast from 'react-hot-toast'

interface CleaningOperation { operation: string; params: Record<string, any> }
interface CleaningJob { id: string; status: string; operations: CleaningOperation[]; created_at: string; rows_before: number; rows_after: number }

const ops = [
  { id: 'drop_duplicates', name: 'Remove Duplicates', desc: 'Remove exact duplicate rows', icon: Copy, iconColor: 'text-accent-600', bg: 'bg-accent-ghost' },
  { id: 'fill_missing_mean', name: 'Fill Missing (Mean)', desc: 'Fill missing values with column mean', icon: TrendingUp, iconColor: 'text-primary', bg: 'bg-primary-ghost' },
  { id: 'fill_missing_median', name: 'Fill Missing (Median)', desc: 'Fill missing values with column median', icon: BarChart3, iconColor: 'text-mint-dark', bg: 'bg-mint-ghost' },
  { id: 'drop_missing', name: 'Drop Missing Values', desc: 'Remove rows with any missing values', icon: Trash2, iconColor: 'text-danger-600', bg: 'bg-danger-50' },
]
const defaultParams: Record<string, Record<string, any>> = {
  drop_duplicates: {}, fill_missing_mean: { method: 'mean' }, fill_missing_median: { method: 'median' }, drop_missing: { method: 'drop' },
}

export default function CleaningPage() {
  const { id } = useParams<{ id: string }>()
  const [selected, setSelected] = useState<CleaningOperation[]>([])
  const [history, setHistory] = useState<CleaningJob[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => { fetchHistory(); fetchColumns(); }, [id])

  const fetchHistory = async () => {
    try { const r = await api.get(`/cleaning/${id}/history`); setHistory(r.data) }
    catch { /* */ }
    finally { setLoading(false) }
  }

  const fetchColumns = async () => {
    try { const r = await api.get(`/datasets/${id}/columns`); setColumns(r.data) }
    catch { /* */ }
  }

  const toggle = (opId: string) => {
    setSelected(prev => {
      const exists = prev.find(p => p.operation === opId)
      return exists ? prev.filter(p => p.operation !== opId) : [...prev, { operation: opId, params: defaultParams[opId] }]
    })
  }

  const updateParam = (opId: string, param: string, value: any) => {
    setSelected(prev => prev.map(p => 
      p.operation === opId ? { ...p, params: { ...p.params, [param]: value } } : p
    ))
  }

  const handleClean = async () => {
    if (!selected.length) { toast.error('Select at least one operation'); return }
    setCleaning(true)
    try { await api.post(`/cleaning/${id}/apply`, { operations: selected }); toast.success('Cleaning completed'); setSelected([]); fetchHistory() }
    catch { toast.error('Cleaning failed') }
    finally { setCleaning(false) }
  }

  const handleUndo = async (jid: string) => {
    try { await api.post(`/cleaning/jobs/${jid}/undo`); toast.success('Undone'); fetchHistory() }
    catch { toast.error('Failed to undo') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/app/datasets/${id}`} className="p-2 text-text-muted hover:text-text hover:bg-surface-100 rounded-widget transition-all duration-150"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Data Cleaning</h1>
          <p className="text-text-faint text-xs mt-0.5">Select and apply cleaning operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-primary-ghost rounded-widget flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-sm font-display font-bold text-surface-900">Select Operations</h2>
            </div>
            <div className="space-y-2">
              {ops.map(op => {
                const isSel = selected.some(s => s.operation === op.id)
                return (
                  <label key={op.id} className={`flex items-center gap-3 p-3 border rounded-widget cursor-pointer transition-all duration-150 ${
                    isSel ? 'border-primary/30 bg-primary-ghost' : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                  }`}>
                    <div className={`w-9 h-9 rounded-widget flex items-center justify-center ${isSel ? 'bg-primary/10' : op.bg}`}>
                      <op.icon className={`w-4 h-4 ${op.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text">{op.name}</p>
                      <p className="text-[11px] text-text-faint">{op.desc}</p>
                    </div>
                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all ${
                      isSel ? 'border-primary bg-primary' : 'border-surface-300'
                    }`}>
                      {isSel && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" checked={isSel} onChange={() => toggle(op.id)} className="sr-only" />
                  </label>
                )
              })}
            </div>
            <div className="mt-5 flex gap-2 pt-4 border-t border-surface-200">
              <Button onClick={handleClean} disabled={cleaning || !selected.length}>
                {cleaning ? <Spinner size="sm" color="white" /> : <Play className="w-4 h-4" />}
                Apply Cleaning
              </Button>
              <Button variant={showHistory ? 'ghost' : 'secondary'} onClick={() => setShowHistory(!showHistory)} className={showHistory ? 'bg-primary-ghost text-primary border border-primary/10' : ''}>
                <History className="w-4 h-4" /> History ({history.length})
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <CircleDot className="w-4 h-4 text-text-faint" />
              <h2 className="text-xs font-display font-bold text-surface-900">Selected ({selected.length})</h2>
            </div>
            {!selected.length ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-surface-100 rounded-widget flex items-center justify-center mx-auto mb-2">
                  <Wand2 className="w-4 h-4 text-text-faint" />
                </div>
                <p className="text-[11px] text-text-faint font-medium">No operations selected</p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {selected.map(op => {
                  const info = ops.find(o => o.id === op.operation)
                  return (
                    <li key={op.operation} className="flex flex-col gap-2 p-2.5 bg-surface-50 rounded-widget">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{info?.icon && <info.icon className="w-3.5 h-3.5" />}</span>
                          <span className="text-xs font-medium text-text-secondary">{info?.name}</span>
                        </div>
                        <button onClick={() => toggle(op.operation)} className="p-2 text-text-faint hover:text-danger-600 hover:bg-danger-50 rounded-widget transition-colors" aria-label={`Remove ${info?.name}`}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {(op.operation === 'fill_missing_mean' || op.operation === 'fill_missing_median') && (
                        <select 
                          className="input-field text-xs py-1.5" 
                          value={op.params.column || ''}
                          onChange={(e) => updateParam(op.operation, 'column', e.target.value)}
                        >
                          <option value="">Select column...</option>
                          {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {showHistory && (
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-surface-100 rounded-widget flex items-center justify-center">
              <History className="w-4 h-4 text-text-muted" />
            </div>
            <h2 className="text-sm font-display font-bold text-surface-900">Cleaning History</h2>
          </div>
          {!history.length ? (
            <p className="text-center py-6 text-xs text-text-faint font-medium">No cleaning history</p>
          ) : (
            <div className="space-y-2">
              {history.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 border border-surface-200 rounded-widget hover:bg-surface-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-widget flex items-center justify-center ${job.status === 'completed' ? 'bg-mint-ghost' : 'bg-danger-50'}`}>
                      {job.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-mint-dark" /> : <X className="w-4 h-4 text-danger-600" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text">{job.operations.length} operation(s)</p>
                      <p className="text-[10px] text-text-faint">{new Date(job.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${job.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>{job.status}</span>
                    {job.status === 'completed' && (
                      <button onClick={() => handleUndo(job.id)} className="p-2 text-text-faint hover:text-accent-600 hover:bg-accent-ghost rounded-widget transition-colors" aria-label="Undo cleaning job">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
