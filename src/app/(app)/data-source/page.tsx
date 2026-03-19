'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileSpreadsheet, Download, Trash2, CheckCircle2,
  AlertTriangle, XCircle, Info, RefreshCw, Search, ChevronLeft,
  ChevronRight, ArrowUpDown, Edit3, X
} from 'lucide-react'
import { useState, useRef, useCallback, useEffect } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

interface SourceInfo {
  id: string
  fileName: string
  rowCount: number
  columnCount: number
  validationStatus: string
  uploadDate?: string
}

interface ValidationCheck {
  name: string
  severity: 'error' | 'warning' | 'info'
  passed: boolean
  message: string
  details?: string[]
}

interface ValidationReport {
  overallStatus: string
  checks: ValidationCheck[]
  errorCount: number
  warningCount: number
  infoCount: number
}

interface SampleFile {
  id: string
  fileName: string
  industry: string
  columnCount: number
  rowCount: number
}

const industryIcons: Record<string, string> = {
  Travel: '✈️', Entertainment: '🎬', Hospitality: '🏨',
  'Tour Operator': '🗺️', Retail: '🛒', Freelance: '💼', Generic: '📄',
}

export default function DataSourcePage() {
  const [source, setSource] = useState<SourceInfo | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null)
  const [samples, setSamples] = useState<SampleFile[]>([])

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [showValidation, setShowValidation] = useState(false)
  const [editCell, setEditCell] = useState<{ row: number; col: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const ROWS_PER_PAGE = 25

  // Load existing source on mount
  useEffect(() => {
    loadSource()
    loadSamples()
  }, [])

  async function loadSource() {
    try {
      const res = await fetch('/api/source')
      const json = await res.json()
      if (json.source) {
        setSource(json.source)
        setHeaders(json.headers || [])
        setData(json.data || [])
        setTotalRows(json.totalRows || 0)
        setColumnMapping(json.columnMapping || {})
        setValidationReport(json.validationReport || null)
      }
    } catch (err) {
      console.error('Failed to load source:', err)
    }
  }

  async function loadSamples() {
    try {
      const res = await fetch('/api/source/samples')
      const json = await res.json()
      setSamples(json.samples || [])
    } catch (err) {
      console.error('Failed to load samples:', err)
    }
  }

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 15, 90))
    }, 200)

    try {
      const res = await fetch('/api/source', { method: 'POST', body: formData })
      clearInterval(progressInterval)
      setUploadProgress(100)

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')

      setSource(json.source)
      setHeaders(json.headers)
      setData(json.data)
      setTotalRows(json.totalRows)
      setColumnMapping(json.columnMapping)
      setValidationReport(json.validationReport)
      setCurrentPage(1)
      setShowValidation(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      alert(msg)
    } finally {
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  async function handleRemoveSource() {
    if (!confirm('This will remove the current data source. Previously generated invoices will remain saved. Continue?')) return
    try {
      await fetch('/api/source', { method: 'DELETE' })
      setSource(null)
      setHeaders([])
      setData([])
      setTotalRows(0)
      setColumnMapping({})
      setValidationReport(null)
    } catch (err) {
      console.error('Failed to remove source:', err)
    }
  }

  async function handleDownloadSample(category: string) {
    window.open(`/api/source/samples?category=${category}`, '_blank')
  }

  // Filtering & sorting
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true
    return Object.values(row).some((v) =>
      String(v).toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortCol) return 0
    const aVal = String(a[sortCol] ?? '')
    const bVal = String(b[sortCol] ?? '')
    const cmp = aVal.localeCompare(bVal, undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE)
  const pagedData = sortedData.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE)

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  function handleCellEdit(rowIdx: number, col: string, value: string) {
    const globalIdx = (currentPage - 1) * ROWS_PER_PAGE + rowIdx
    setData((prev) => {
      const updated = [...prev]
      updated[globalIdx] = { ...updated[globalIdx], [col]: value }
      return updated
    })
    setEditCell(null)
  }

  const sevIcon = (severity: string, passed: boolean) => {
    if (passed) return <CheckCircle2 size={15} color="var(--color-success)" />
    if (severity === 'error') return <XCircle size={15} color="var(--color-error)" />
    if (severity === 'warning') return <AlertTriangle size={15} color="var(--color-warning)" />
    return <Info size={15} color="var(--color-info)" />
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Data Source</h1>
            <p className="page-subtitle">Upload and manage your Excel data for invoice generation.</p>
          </div>
          {source && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowValidation(!showValidation)}>
                <CheckCircle2 size={14} /> Validation Report
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                <RefreshCw size={14} /> Replace File
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleRemoveSource} style={{ color: 'var(--color-error)' }}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={onFileChange} style={{ display: 'none' }} />

      {/* Upload Zone - Show when no source */}
      {!source && (
        <motion.div variants={itemVariants}>
          <div
            className={`drop-zone ${dragOver ? 'dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{ marginBottom: 24, position: 'relative' }}
          >
            {uploading ? (
              <div>
                <RefreshCw size={32} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                <div className="drop-zone-title">Processing file...</div>
                <div style={{ marginTop: 12 }}>
                  <div className="progress-bar" style={{ maxWidth: 300, margin: '0 auto' }}>
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="drop-zone-icon"><Upload size={24} /></div>
                <div className="drop-zone-title">Drop your Excel file here, or click to browse</div>
                <div className="drop-zone-subtitle">Supports .xlsx, .xls, .csv • Max 50MB</div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Source Info Bar */}
      {source && (
        <motion.div variants={itemVariants}>
          <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={20} color="var(--color-primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{source.fileName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {source.rowCount} rows • {source.columnCount} columns
                {columnMapping.firstName && ` • Name: ${columnMapping.firstName}`}
                {columnMapping.amount && ` • Amount: ${columnMapping.amount}`}
              </div>
            </div>
            <span className={`badge ${source.validationStatus === 'passed' ? 'badge-success' : source.validationStatus === 'warnings' ? 'badge-warning' : 'badge-error'}`}>
              {source.validationStatus === 'passed' ? 'Ready to Import' : source.validationStatus === 'warnings' ? 'Warnings' : 'Has Errors'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Validation Report */}
      <AnimatePresence>
        {showValidation && validationReport && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} color="var(--color-primary)" /> Validation Report
                </h3>
                <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }} onClick={() => setShowValidation(false)}>
                  <X size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span className="badge badge-success">{validationReport.checks.filter(c => c.passed).length} Passed</span>
                {validationReport.errorCount > 0 && <span className="badge badge-error">{validationReport.errorCount} Error(s)</span>}
                {validationReport.warningCount > 0 && <span className="badge badge-warning">{validationReport.warningCount} Warning(s)</span>}
                <span className="badge badge-primary">{validationReport.infoCount} Info</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {validationReport.checks.map((check, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    background: check.passed ? 'transparent' : check.severity === 'error' ? 'var(--color-error-light)' : check.severity === 'warning' ? 'var(--color-warning-light)' : 'transparent',
                    borderRadius: 'var(--radius-sm)', fontSize: 13,
                  }}>
                    {sevIcon(check.severity, check.passed)}
                    <span style={{ fontWeight: 500, minWidth: 180 }}>{check.name}</span>
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{check.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Preview Table */}
      {source && data.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Table toolbar */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="search-bar" style={{ minWidth: 240 }}>
                  <Search size={14} color="var(--text-tertiary)" />
                  <input placeholder="Search data..." value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  Showing {pagedData.length} of {filteredData.length} rows
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={14} /></button>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Page {currentPage} of {totalPages || 1}</span>
                <button className="btn btn-ghost btn-sm" disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={14} /></button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', maxHeight: 500 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 50, textAlign: 'center' }}>#</th>
                    {headers.map((h) => (
                      <th key={h} onClick={() => handleSort(h)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {h}
                          <ArrowUpDown size={10} color={sortCol === h ? 'var(--color-primary)' : 'var(--text-tertiary)'} />
                          {/* Show mapping badge */}
                          {Object.entries(columnMapping).some(([, v]) => v === h) && (
                            <span style={{ fontSize: 9, background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '1px 4px', borderRadius: 3, fontWeight: 600 }}>
                              {Object.entries(columnMapping).find(([, v]) => v === h)?.[0]}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((row, rowIdx) => {
                    const globalIdx = (currentPage - 1) * ROWS_PER_PAGE + rowIdx
                    return (
                      <tr key={globalIdx}>
                        <td style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>{globalIdx + 1}</td>
                        {headers.map((h) => (
                          <td key={h}
                            onDoubleClick={() => setEditCell({ row: rowIdx, col: h })}
                            style={{ cursor: 'text', minWidth: 100, position: 'relative' }}
                          >
                            {editCell?.row === rowIdx && editCell?.col === h ? (
                              <input autoFocus
                                defaultValue={String(row[h] ?? '')}
                                onBlur={(e) => handleCellEdit(rowIdx, h, e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditCell(null) }}
                                style={{ width: '100%', border: '1px solid var(--color-primary)', borderRadius: 3, padding: '2px 4px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                              />
                            ) : (
                              <span style={{ fontSize: 13 }}>{String(row[h] ?? '')}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sample Excel Downloads */}
      <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>📥 Download Sample Excel Templates</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Use these pre-formatted templates to ensure your data is correctly structured.
          </p>
          <div className="grid-3" style={{ gap: 12 }}>
            {samples.map((s) => (
              <div key={s.id} className="card card-interactive" style={{ padding: 16, cursor: 'pointer' }}
                onClick={() => handleDownloadSample(s.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{industryIcons[s.industry] || '📄'}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.industry}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {s.columnCount} columns • {s.rowCount} sample rows
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.fileName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: 'var(--color-primary)', fontWeight: 500 }}>
                  <Download size={12} /> Download .xlsx
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
