'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, CheckCircle2, XCircle, AlertTriangle, Info,
  FileSpreadsheet, RefreshCw, ArrowRight, Shield, X
} from 'lucide-react'
import { useState, useRef } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

interface ValidationCheck {
  id: string
  name: string
  severity: 'error' | 'warning' | 'info'
  passed: boolean
  message: string
  details?: string[]
}

interface ValidationResult {
  overallStatus: string
  overallMessage: string
  score: number
  checks: ValidationCheck[]
  errorCount: number
  warningCount: number
  infoCount: number
  headers: string[]
  rowCount: number
  columnCount: number
  sheetNames: string[]
}

export default function ValidatePage() {
  const [validating, setValidating] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleValidate(selectedFile: File) {
    setValidating(true)
    setFileName(selectedFile.name)
    setFile(selectedFile)
    setResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await fetch('/api/validate', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Validation failed')
      setResult(json)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Validation failed')
    } finally {
      setValidating(false)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleValidate(f)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleValidate(f)
  }

  async function handleImportFile() {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/source', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      window.location.href = '/data-source'
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Import failed')
    }
  }

  function handleReset() {
    setResult(null)
    setFileName('')
    setFile(null)
  }

  const sevIcon = (severity: string, passed: boolean) => {
    if (passed) return <CheckCircle2 size={16} color="var(--color-success)" />
    if (severity === 'error') return <XCircle size={16} color="var(--color-error)" />
    if (severity === 'warning') return <AlertTriangle size={16} color="var(--color-warning)" />
    return <Info size={16} color="var(--color-info)" />
  }

  const statusColor = (status: string) => {
    if (status === 'passed') return 'var(--color-success)'
    if (status === 'warnings') return 'var(--color-warning)'
    return 'var(--color-error)'
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="page-header">
        <h1 className="page-title">Validate Excel</h1>
        <p className="page-subtitle">Check your Excel file for formatting issues before importing. This does NOT import the file.</p>
      </motion.div>

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={onFileChange} style={{ display: 'none' }} />

      {/* Upload Zone */}
      {!result && !validating && (
        <motion.div variants={itemVariants}>
          <div
            className={`drop-zone ${dragOver ? 'dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div className="drop-zone-icon"><Shield size={24} /></div>
            <div className="drop-zone-title">Drop an Excel file to validate</div>
            <div className="drop-zone-subtitle">This is a standalone validation tool — your file will NOT be imported</div>
          </div>
        </motion.div>
      )}

      {/* Validating */}
      {validating && (
        <motion.div variants={itemVariants}>
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <RefreshCw size={36} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Validating {fileName}...</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Running 13 validation checks</div>
          </div>
        </motion.div>
      )}

      {/* Validation Result */}
      {result && (
        <>
          {/* Score Card */}
          <motion.div variants={itemVariants} style={{ marginBottom: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {/* Score Circle */}
                <div style={{
                  width: 80, height: 80, borderRadius: 'var(--radius-full)',
                  border: `4px solid ${statusColor(result.overallStatus)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: statusColor(result.overallStatus) }}>
                    {result.score}%
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                    {result.overallMessage}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {fileName} • {result.rowCount} rows • {result.columnCount} columns • {result.sheetNames?.length || 1} sheet(s)
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <span className="badge badge-success">{result.checks.filter(c => c.passed).length} passed</span>
                    {result.errorCount > 0 && <span className="badge badge-error">{result.errorCount} error(s)</span>}
                    {result.warningCount > 0 && <span className="badge badge-warning">{result.warningCount} warning(s)</span>}
                    <span className="badge badge-primary">{result.infoCount} info</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.overallStatus !== 'errors' && (
                    <button className="btn btn-primary btn-sm" onClick={handleImportFile}>
                      <ArrowRight size={14} /> Import This File
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={handleReset}>
                    <RefreshCw size={14} /> Validate Another
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Checks */}
          <motion.div variants={itemVariants}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-primary)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>Detailed Validation Report</h3>
              </div>
              {result.checks.map((check, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px',
                  borderBottom: i < result.checks.length - 1 ? '1px solid var(--border-secondary)' : 'none',
                  background: !check.passed && check.severity === 'error' ? 'var(--color-error-light)' : !check.passed && check.severity === 'warning' ? 'var(--color-warning-light)' : 'transparent',
                }}>
                  {sevIcon(check.severity, check.passed)}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{check.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{check.message}</div>
                    {check.details && check.details.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {check.details.map((d, j) => <div key={j}>• {d}</div>)}
                      </div>
                    )}
                  </div>
                  <span className={`badge ${check.passed ? 'badge-success' : check.severity === 'error' ? 'badge-error' : check.severity === 'warning' ? 'badge-warning' : 'badge-primary'}`}
                    style={{ fontSize: 11 }}>
                    {check.passed ? 'PASS' : check.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
