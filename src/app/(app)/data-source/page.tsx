'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileSpreadsheet, Download, Trash2, CheckCircle2,
  AlertTriangle, XCircle, Info, RefreshCw, Search, ChevronLeft,
  ChevronRight, ArrowUpDown, Edit3, X, Plus, Save, Database
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

// Rich sample travel data with many dynamic columns
const SAMPLE_HEADERS = [
  // 📋 Invoice Info
  'First Name', 'Last Name', 'Email', 'Phone', 'Address',
  // 📦 Booking Details
  'Service Description', 'Destination', 'Start Date', 'End Date', 'Hotel Name', 'Pax 2 Name', 'Pax 3 Name', 'Pax Count',
  // 💰 Tax & Totals
  'Amount', 'Discount', 'IGST 5%', 'CGST 9%', 'SGST 9%',
  // 📝 Remarks
  'Category', 'Remarks'
]

const SAMPLE_DATA: Record<string, unknown>[] = [
  { 'First Name': 'Rajesh', 'Last Name': 'Kumar', 'Email': 'rajesh@example.com', 'Phone': '+91 98765 43210', 'Address': '123 Tech Park, Bangalore', 'Amount': '145000', 'Discount': '0', 'Category': 'Travel', 'Service Description': 'Cab Service - Airport Transfer & City Tour', 'Destination': 'Singapore', 'Start Date': '2026-04-01', 'End Date': '2026-04-05', 'Hotel Name': 'Marina Bay Sands', 'Pax 2 Name': 'Priya Kumar', 'Pax 3 Name': 'Arun Kumar', 'Pax Count': '3', 'IGST 5%': '7250', 'CGST 9%': '', 'SGST 9%': '', 'Remarks': 'VIP transfer requested' },
  { 'First Name': 'Suresh', 'Last Name': 'Rajan', 'Email': 'suresh.r@example.com', 'Phone': '+91 99887 76655', 'Address': '45 Lake View, Mumbai', 'Amount': '89000', 'Discount': '2000', 'Category': 'Hospitality', 'Service Description': 'Hotel Booking - Deluxe Suite', 'Destination': 'Maldives', 'Start Date': '2026-04-10', 'End Date': '2026-04-15', 'Hotel Name': 'Soneva Fushi Resort', 'Pax 2 Name': 'Lakshmi Rajan', 'Pax 3 Name': '', 'Pax Count': '2', 'IGST 5%': '', 'CGST 9%': '8010', 'SGST 9%': '8010', 'Remarks': 'Honeymoon package' },
  { 'First Name': 'Anitha', 'Last Name': 'Venkatesh', 'Email': 'anitha.v@email.com', 'Phone': '+91 91234 56789', 'Address': '78 Beach Road, Chennai', 'Amount': '210000', 'Discount': '5000', 'Category': 'Travel', 'Service Description': 'Full Tour Package - Flight + Hotel + Cab', 'Destination': 'Dubai', 'Start Date': '2026-05-01', 'End Date': '2026-05-08', 'Hotel Name': 'Burj Al Arab', 'Pax 2 Name': 'Venkatesh S', 'Pax 3 Name': 'Deepa V', 'Pax Count': '3', 'IGST 5%': '10500', 'CGST 9%': '', 'SGST 9%': '', 'Remarks': 'Business trip + family extension' },
  { 'First Name': 'Mohammed', 'Last Name': 'Farooq', 'Email': 'm.farooq@corp.in', 'Phone': '+91 98712 34567', 'Address': '', 'Amount': '56000', 'Discount': '0', 'Category': 'Travel', 'Service Description': 'Domestic Flight Booking', 'Destination': 'Goa', 'Start Date': '2026-03-28', 'End Date': '2026-04-02', 'Hotel Name': 'Taj Exotica', 'Pax 2 Name': 'Fathima Farooq', 'Pax 3 Name': 'Zaid Farooq', 'Pax Count': '3', 'IGST 5%': '2800', 'CGST 9%': '', 'SGST 9%': '', 'Remarks': '' },
  { 'First Name': 'Kavitha', 'Last Name': 'Nair', 'Email': 'kavitha.nair@email.com', 'Phone': '+91 87654 32109', 'Address': '12 Hill View, Kochi', 'Amount': '175000', 'Discount': '0', 'Category': 'Travel', 'Service Description': 'International Flight + Visa Processing', 'Destination': 'London', 'Start Date': '2026-06-15', 'End Date': '2026-06-25', 'Hotel Name': 'The Savoy', 'Pax 2 Name': 'Nair P K', 'Pax 3 Name': '', 'Pax Count': '2', 'IGST 5%': '8750', 'CGST 9%': '', 'SGST 9%': '', 'Remarks': 'Visa expedited processing' },
  { 'First Name': 'Arun', 'Last Name': 'Prakash', 'Email': 'arun.p@corp.in', 'Phone': '+91 76543 21098', 'Address': 'Sector 4, Noida', 'Amount': '320000', 'Discount': '10000', 'Category': 'Travel', 'Service Description': 'Corporate Group Tour - Team Outing', 'Destination': 'Thailand', 'Start Date': '2026-07-01', 'End Date': '2026-07-06', 'Hotel Name': 'Centara Grand', 'Pax 2 Name': 'Vikram S', 'Pax 3 Name': 'Deepak M', 'Pax Count': '12', 'IGST 5%': '16000', 'CGST 9%': '', 'SGST 9%': '', 'Remarks': 'Group of 12 employees, need bus transfer' },
  { 'First Name': 'Priya', 'Last Name': 'Sharma', 'Email': 'priya.sharma@example.com', 'Phone': '+91 98989 89898', 'Address': '1st Avenue, Pune', 'Amount': '42000', 'Discount': '0', 'Category': 'Hospitality', 'Service Description': 'Resort Stay - Weekend Getaway', 'Destination': 'Ooty', 'Start Date': '2026-04-18', 'End Date': '2026-04-20', 'Hotel Name': 'Savoy IHCL', 'Pax 2 Name': 'Rahul Sharma', 'Pax 3 Name': 'not available', 'Pax Count': '2', 'IGST 5%': '', 'CGST 9%': '3780', 'SGST 9%': '3780', 'Remarks': 'Anniversary celebration' },
  { 'First Name': 'Ganesh', 'Last Name': 'Iyer', 'Email': 'ganesh.iyer@email.com', 'Phone': '+91 87878 78787', 'Address': '', 'Amount': '98000', 'Discount': '5000', 'Category': 'Travel', 'Service Description': 'Cruise Booking - Southeast Asia', 'Destination': 'Singapore-Malaysia', 'Start Date': '2026-08-10', 'End Date': '2026-08-18', 'Hotel Name': '', 'Pax 2 Name': 'Meena Iyer', 'Pax 3 Name': 'Karthik Iyer', 'Pax Count': '3', 'IGST 5%': '4900', 'CGST 9%': '', 'SGST 9%': '', 'Remarks': 'Balcony cabin requested' },
  { 'First Name': 'Divya', 'Last Name': 'Krishnan', 'Email': 'divya.k@example.com', 'Phone': '+91 76767 67676', 'Address': '15 Cross St, Hyderabad', 'Amount': '135000', 'Discount': '0', 'Category': 'Travel', 'Service Description': 'Honeymoon Package - Flight + Hotel + Tours', 'Destination': 'Bali', 'Start Date': '2026-05-20', 'End Date': '2026-05-28', 'Hotel Name': 'AYANA Resort', 'Pax 2 Name': 'Sanjay K', 'Pax 3 Name': '', 'Pax Count': '2', 'IGST 5%': '6750', 'CGST 9%': '', 'SGST 9%': '', 'Remarks': 'Special honeymoon decoration at hotel' },
  { 'First Name': 'Vijay', 'Last Name': 'Anand', 'Email': 'vijay.a@email.com', 'Phone': '+91 65656 56565', 'Address': '20 Main Rd, Jaipur', 'Amount': '67000', 'Discount': '1500', 'Category': 'Travel', 'Service Description': 'Cab Service - Multi-City Tour', 'Destination': 'Rajasthan', 'Start Date': '2026-04-25', 'End Date': '2026-05-02', 'Hotel Name': 'Umaid Bhawan Palace', 'Pax 2 Name': 'Meera Anand', 'Pax 3 Name': 'Rohan Anand', 'Pax Count': '4', 'IGST 5%': '', 'CGST 9%': '6030', 'SGST 9%': '6030', 'Remarks': 'Jaipur-Udaipur-Jodhpur circuit' },
]

const SECTION_COLORS: Record<string, { bg: string, text: string }> = {
  '📋 Invoice Info': { bg: '#DBEAFE', text: '#1E40AF' },
  '💰 Tax & Totals': { bg: '#FEF3C7', text: '#92400E' },
  '📝 Remarks': { bg: '#F3F4F6', text: '#374151' },
  '📦 Booking Details': { bg: '#D1FAE5', text: '#065F46' },
}

function getColumnSection(colName: string): string {
  const lower = colName.toLowerCase()
  if (/(first\s*name|last\s*name|email|phone|mobile|address)/.test(lower)) return '📋 Invoice Info'
  if (/(amount|total|discount|tax|gst|vat|igst|cgst|sgst|cess|tds)/.test(lower)) return '💰 Tax & Totals'
  if (/(remark|note|category)/.test(lower)) return '📝 Remarks'
  return '📦 Booking Details'
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

  // New states for editing
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const ROWS_PER_PAGE = 25

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
      setHasUnsavedChanges(false)
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
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error('Failed to remove source:', err)
    }
  }

  async function handleDownloadSample(category: string) {
    window.open(`/api/source/samples?category=${category}`, '_blank')
  }

  // ===== NEW: Add Row =====
  function handleAddRow() {
    const newRow: Record<string, unknown> = {}
    headers.forEach(h => { newRow[h] = '' })
    setData(prev => [...prev, newRow])
    setTotalRows(prev => prev + 1)
    setHasUnsavedChanges(true)
    // Jump to last page
    const newTotal = data.length + 1
    const newPages = Math.ceil(newTotal / ROWS_PER_PAGE)
    setCurrentPage(newPages)
  }

  // ===== NEW: Add Column =====
  function handleAddColumn() {
    const name = newColumnName.trim()
    if (!name) return
    if (headers.includes(name)) {
      alert(`Column "${name}" already exists.`)
      return
    }
    setHeaders(prev => [...prev, name])
    setData(prev => prev.map(row => ({ ...row, [name]: '' })))
    setNewColumnName('')
    setShowAddColumn(false)
    setHasUnsavedChanges(true)
  }

  // ===== NEW: Delete Row =====
  function handleDeleteRow(globalIdx: number) {
    setData(prev => prev.filter((_, i) => i !== globalIdx))
    setTotalRows(prev => prev - 1)
    setHasUnsavedChanges(true)
  }

  // ===== NEW: Delete Column =====
  function handleDeleteColumn(colName: string) {
    if (!confirm(`Remove column "${colName}" from all rows?`)) return
    setHeaders(prev => prev.filter(h => h !== colName))
    setData(prev => prev.map(row => {
      const newRow = { ...row }
      delete newRow[colName]
      return newRow
    }))
    setHasUnsavedChanges(true)
  }

  // ===== NEW: Save Changes =====
  async function handleSaveChanges() {
    setSaving(true)
    try {
      const res = await fetch('/api/source', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headers, data }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Save failed')

      setSource(json.source)
      setColumnMapping(json.columnMapping)
      setValidationReport(json.validationReport)
      setTotalRows(json.totalRows)
      setHasUnsavedChanges(false)
      setShowValidation(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  // ===== NEW: Load Sample Data =====
  async function handleLoadSampleData() {
    setHeaders([...SAMPLE_HEADERS])
    setData(SAMPLE_DATA.map(row => ({ ...row })))
    setTotalRows(SAMPLE_DATA.length)
    setSource({
      id: 'sample',
      fileName: 'Sample Travel Data (Unsaved)',
      rowCount: SAMPLE_DATA.length,
      columnCount: SAMPLE_HEADERS.length,
      validationStatus: 'passed',
    })
    setHasUnsavedChanges(true)
    setCurrentPage(1)
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
    setHasUnsavedChanges(true)
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
            <p className="page-subtitle">Upload, edit, and manage your data for invoice generation.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!source && (
              <button className="btn btn-primary btn-sm" onClick={handleLoadSampleData}>
                <Database size={14} /> Load Sample Data
              </button>
            )}
            {source && (
              <>
                {hasUnsavedChanges && (
                  <button className="btn btn-primary btn-sm" onClick={handleSaveChanges} disabled={saving}
                    style={{ animation: 'pulse 2s infinite' }}>
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => setShowValidation(!showValidation)}>
                  <CheckCircle2 size={14} /> Validation
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                  <RefreshCw size={14} /> Replace File
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleRemoveSource} style={{ color: 'var(--color-error)' }}>
                  <Trash2 size={14} /> Remove
                </button>
              </>
            )}
          </div>
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
                <div className="drop-zone-subtitle">Supports .xlsx, .xls, .csv • Max 50MB • Or use "Load Sample Data" above</div>
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
                {data.length} rows • {headers.length} columns
                {columnMapping.firstName && ` • Name: ${columnMapping.firstName}`}
                {columnMapping.amount && ` • Amount: ${columnMapping.amount}`}
                {hasUnsavedChanges && <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}> • Unsaved changes</span>}
              </div>
            </div>
            <span className={`badge ${source.validationStatus === 'passed' ? 'badge-success' : source.validationStatus === 'warnings' ? 'badge-warning' : 'badge-error'}`}>
              {source.validationStatus === 'passed' ? 'Ready' : source.validationStatus === 'warnings' ? 'Warnings' : 'Has Errors'}
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
      {source && data.length >= 0 && (
        <motion.div variants={itemVariants}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Table toolbar */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="search-bar" style={{ minWidth: 200 }}>
                  <Search size={14} color="var(--text-tertiary)" />
                  <input placeholder="Search data..." value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {filteredData.length} rows
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button className="btn btn-primary btn-sm" onClick={handleAddRow} title="Add a new empty row">
                  <Plus size={14} /> Row
                </button>
                {showAddColumn ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      autoFocus
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') { setShowAddColumn(false); setNewColumnName('') } }}
                      placeholder="Column name..."
                      style={{ width: 140, padding: '4px 8px', fontSize: 12, border: '1px solid var(--color-primary)', borderRadius: 4, outline: 'none', fontFamily: 'inherit' }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleAddColumn} style={{ padding: '4px 8px' }}>
                      <CheckCircle2 size={12} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setShowAddColumn(false); setNewColumnName('') }} style={{ padding: '4px 8px' }}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowAddColumn(true)} title="Add a new column">
                    <Plus size={14} /> Column
                  </button>
                )}
                <div style={{ width: 1, height: 20, background: 'var(--border-primary)', margin: '0 4px' }} />
                <button className="btn btn-ghost btn-sm" disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={14} /></button>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pg {currentPage}/{totalPages || 1}</span>
                <button className="btn btn-ghost btn-sm" disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={14} /></button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', maxHeight: 520 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 50, textAlign: 'center' }}>#</th>
                    {headers.map((h) => {
                      const section = getColumnSection(h)
                      const colors = SECTION_COLORS[section]
                      return (
                        <th key={h} style={{ cursor: 'pointer', userSelect: 'none', position: 'relative', minWidth: 130 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 9, background: colors.bg, color: colors.text, padding: '2px 6px', borderRadius: 4, fontWeight: 700, letterSpacing: 0.5 }}>
                                {section}
                              </span>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteColumn(h) }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0, lineHeight: 1, fontSize: 16 }}
                                title={`Remove column "${h}"`}>×</button>
                            </div>
                            <span onClick={() => handleSort(h)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                              {h}
                              <ArrowUpDown size={11} color={sortCol === h ? 'var(--color-primary)' : 'var(--text-tertiary)'} />
                            </span>
                          </div>
                        </th>
                      )
                    })}
                    <th style={{ width: 40, textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pagedData.length === 0 && (
                    <tr>
                      <td colSpan={headers.length + 2} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>
                        No data rows. Click "+ Row" to add one, or upload an Excel file.
                      </td>
                    </tr>
                  )}
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
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => handleDeleteRow(globalIdx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2 }}
                            title="Delete this row">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom info bar */}
            {hasUnsavedChanges && (
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-primary)', background: 'var(--color-warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                  ⚠️ You have unsaved changes. Click "Save Changes" to persist your edits.
                </span>
                <button className="btn btn-primary btn-sm" onClick={handleSaveChanges} disabled={saving}>
                  <Save size={13} /> {saving ? 'Saving...' : 'Save Now'}
                </button>
              </div>
            )}
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
