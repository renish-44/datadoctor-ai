import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Database, Trash2, Eye, FileSpreadsheet, FileJson, Search } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Card from '../components/common/Card'
import Spinner from '../components/common/Spinner'
import api from '../services/api'
import toast from 'react-hot-toast'

interface Dataset {
  id: string; name: string; original_filename: string; row_count: number; column_count: number; status: string; created_at: string
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchDatasets() }, [])

  const fetchDatasets = async () => {
    try { const r = await api.get('/datasets/'); setDatasets(r.data) }
    catch { toast.error('Failed to load datasets') }
    finally { setLoading(false) }
  }

  const onDrop = async (files: File[]) => {
    if (!files.length) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', files[0])
      await api.post('/datasets/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Dataset uploaded successfully'); fetchDatasets()
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'], 'application/json': ['.json'] },
    maxFiles: 1, disabled: uploading
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this dataset?')) return
    try { await api.delete(`/datasets/${id}`); toast.success('Deleted'); fetchDatasets() }
    catch { toast.error('Failed to delete') }
  }

  const filtered = datasets.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.original_filename.toLowerCase().includes(searchQuery.toLowerCase()))
  const getFileIcon = (fn: string) => fn.endsWith('.json') ? <FileJson className="w-4 h-4 text-accent-500" /> : <FileSpreadsheet className="w-4 h-4 text-primary" />

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900">Datasets</h1>
        <p className="text-text-muted mt-0.5 text-xs">Manage and upload your data files</p>
      </div>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border border-dashed rounded-card p-10 text-center transition-all duration-200 cursor-pointer ${
          isDragActive ? 'border-primary bg-primary-ghost' : 'border-surface-300 hover:border-primary/40 hover:bg-surface-50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <div className={`w-14 h-14 mx-auto rounded-widget flex items-center justify-center mb-4 transition-colors ${
          isDragActive ? 'bg-primary-ghost' : 'bg-surface-100'
        }`}>
          <Upload className={`w-6 h-6 ${isDragActive ? 'text-primary' : 'text-text-faint'}`} />
        </div>
        {uploading ? (
          <div className="flex items-center justify-center gap-2"><Spinner size="sm" /><span className="text-xs font-medium text-text-muted">Uploading...</span></div>
        ) : (
          <>
            <p className="text-sm text-text-secondary font-medium">{isDragActive ? 'Drop your file here' : 'Drag & drop a file here, or click to browse'}</p>
            <p className="text-[11px] text-text-faint mt-1.5">CSV, Excel, JSON &middot; Max 500MB</p>
          </>
        )}
      </div>

      {/* Search */}
      {datasets.length > 0 && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-faint" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search datasets..." className="input-field pl-9 py-2.5 text-xs" />
        </div>
      )}

      {/* Dataset grid */}
      {datasets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-surface-100 rounded-card flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6 text-text-faint" />
            </div>
            <p className="text-sm font-semibold text-text-secondary">No datasets yet</p>
            <p className="text-[11px] text-text-faint mt-1">Upload your first dataset to get started</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
          {filtered.map((dataset) => (
            <Card key={dataset.id} hover>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 bg-primary-ghost rounded-widget flex items-center justify-center flex-shrink-0">
                  {getFileIcon(dataset.original_filename)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-text truncate">{dataset.name}</h3>
                  <p className="text-[11px] text-text-faint truncate">{dataset.original_filename}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-surface-50 rounded-widget p-2.5 text-center">
                  <p className="text-base font-display font-bold text-text">{dataset.row_count.toLocaleString()}</p>
                  <p className="text-[10px] text-text-faint font-bold uppercase tracking-widest">Rows</p>
                </div>
                <div className="bg-surface-50 rounded-widget p-2.5 text-center">
                  <p className="text-base font-display font-bold text-text">{dataset.column_count}</p>
                  <p className="text-[10px] text-text-faint font-bold uppercase tracking-widest">Columns</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`badge ${dataset.status === 'ready' ? 'badge-success' : 'badge-warning'}`}>{dataset.status}</span>
                <span className="text-[10px] text-text-faint">{new Date(dataset.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-surface-200">
                <Link to={`/app/datasets/${dataset.id}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-primary bg-primary-ghost rounded-widget hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <Eye className="w-3.5 h-3.5" /> View
                </Link>
                <button onClick={() => handleDelete(dataset.id)} className="p-2.5 text-text-faint hover:text-danger-600 hover:bg-danger-50 rounded-widget transition-colors" aria-label={`Delete ${dataset.name}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
