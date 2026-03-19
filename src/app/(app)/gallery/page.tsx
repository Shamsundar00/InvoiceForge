'use client'

import { motion } from 'framer-motion'
import {
  Image as ImageIcon, Grid, List, Search, Filter, Download, Eye,
  Edit3, FileText, Loader2, ChevronLeft, ChevronRight, QrCode,
  RefreshCw, CheckCircle2, AlertCircle, Clock
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  generated: { bg: '#D1FAE5', text: '#059669', icon: CheckCircle2 },
  error: { bg: '#FEE2E2', text: '#DC2626', icon: AlertCircle },
  draft: { bg: '#FEF3C7', text: '#D97706', icon: Clock },
  superseded: { bg: '#E2E8F0', text: '#64748B', icon: RefreshCw },
}

export default function GalleryPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(0)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [exportingAll, setExportingAll] = useState(false)
  const limit = 24

  const loadInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) })
      if (search) params.set('search', search)
      const res = await fetch(`/api/invoices?${params}`)
      const json = await res.json()
      setInvoices(json.invoices || [])
      setTotal(json.total || 0)
    } catch (err) {
      console.error('Load invoices error:', err)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { loadInvoices() }, [loadInvoices])

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
  const totalPages = Math.ceil(total / limit)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Invoice Gallery</h1>
            <p className="page-subtitle">View, manage, and export your generated invoices. {total > 0 && `${total} invoice(s)`}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" disabled={exportingAll || invoices.length === 0}
              onClick={async () => {
                setExportingAll(true)
                try {
                  const res = await fetch('/api/invoices/export', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                  })
                  if (!res.ok) throw new Error('Export failed')
                  const blob = await res.blob()
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = `InvoiceForge_All_${new Date().toISOString().split('T')[0]}.zip`
                  a.click(); URL.revokeObjectURL(url)
                } catch (err) { console.error('Export error:', err) }
                finally { setExportingAll(false) }
              }}>
              {exportingAll ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Exporting...</> : <><Download size={14} /> Export All PDFs</>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search & View Toggle */}
      <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div className="search-bar" style={{ minWidth: 320 }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input placeholder="Search by invoice number, name, or category..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} />
        </div>
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 3 }}>
          <button className={`btn btn-sm ${viewMode === 'grid' ? '' : 'btn-ghost'}`}
            style={{ background: viewMode === 'grid' ? 'var(--bg-surface)' : undefined, padding: '6px 10px', border: 'none' }}
            onClick={() => setViewMode('grid')}><Grid size={14} /></button>
          <button className={`btn btn-sm ${viewMode === 'list' ? '' : 'btn-ghost'}`}
            style={{ background: viewMode === 'list' ? 'var(--bg-surface)' : undefined, padding: '6px 10px', border: 'none' }}
            onClick={() => setViewMode('list')}><List size={14} /></button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ImageIcon size={28} /></div>
            <div className="empty-state-title">No invoices generated yet</div>
            <div className="empty-state-text">
              Generate your first batch of invoices from the Generate page.
            </div>
            <Link href="/generate" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go to Generate</Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid-3" style={{ gap: 16 }}>
            {invoices.map((inv) => {
              const statusStyle = statusColors[inv.status] || statusColors.draft
              const StatusIcon = statusStyle.icon
              return (
                <div key={inv.id} className="card card-interactive" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => setSelectedInvoice(inv)}>
                  {/* Invoice Preview */}
                  <div style={{
                    height: 200, background: 'linear-gradient(135deg, #6366F110, #6366F105)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                    borderBottom: '1px solid var(--border-primary)',
                  }}>
                    <div style={{
                      width: '70%', height: '85%', background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)',
                      padding: 14, display: 'flex', flexDirection: 'column',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--color-primary)' }}>{inv.invoiceNumber}</div>
                        <div style={{ fontSize: 7, color: 'var(--text-tertiary)' }}>
                          {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </div>
                      </div>
                      <div className="skeleton" style={{ width: '70%', height: 5, marginBottom: 4 }} />
                      <div className="skeleton" style={{ width: '50%', height: 5, marginBottom: 4 }} />
                      <div className="skeleton" style={{ width: '85%', height: 5 }} />
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        {inv.qrVerificationHash && <QrCode size={14} color="var(--text-tertiary)" />}
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)' }}>
                          {formatCurrency(inv.totalAmount)}
                        </div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <span className="badge" style={{ fontSize: 10, background: statusStyle.bg, color: statusStyle.text }}>
                        <StatusIcon size={10} /> {inv.status}
                      </span>
                    </div>
                    {inv.revisionNumber > 0 && (
                      <span className="badge" style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, background: '#FEF3C7', color: '#D97706' }}>
                        Rev {inv.revisionNumber}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                      {inv.customerFirstName} {inv.customerLastName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {inv.category || 'General'} • {formatCurrency(inv.totalAmount)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Invoice #', 'Customer', 'Category', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border-primary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const statusStyle = statusColors[inv.status] || statusColors.draft
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-secondary)', cursor: 'pointer' }}
                      onClick={() => setSelectedInvoice(inv)} className="card-interactive">
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--color-primary)' }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: '10px 14px' }}>{inv.customerFirstName} {inv.customerLastName}</td>
                      <td style={{ padding: '10px 14px' }}>{inv.category || '—'}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{formatCurrency(inv.totalAmount)}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge" style={{ fontSize: 10, background: statusStyle.bg, color: statusStyle.text }}>{inv.status}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                        {new Date(inv.invoiceDate).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
            <ChevronRight size={14} />
          </button>
        </motion.div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setSelectedInvoice(null)}>
          <div className="card" style={{ width: 600, maxHeight: '85vh', overflow: 'auto', padding: 28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600 }}>{selectedInvoice.invoiceNumber}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedInvoice(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
              <div><strong>Customer:</strong> {selectedInvoice.customerFirstName} {selectedInvoice.customerLastName}</div>
              <div><strong>Category:</strong> {selectedInvoice.category || '—'}</div>
              <div><strong>Subtotal:</strong> {formatCurrency(selectedInvoice.subtotal)}</div>
              <div><strong>Tax ({selectedInvoice.taxRate}%):</strong> {formatCurrency(selectedInvoice.taxAmount)}</div>
              <div><strong>Discount:</strong> {formatCurrency(selectedInvoice.discountAmount)}</div>
              <div><strong>Total:</strong> <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(selectedInvoice.totalAmount)}</span></div>
              <div><strong>Date:</strong> {new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN')}</div>
              <div><strong>Status:</strong> {selectedInvoice.status}</div>
              {selectedInvoice.marginAmount != null && (
                <div><strong>Margin:</strong> {formatCurrency(selectedInvoice.marginAmount)} ({selectedInvoice.marginPercentage?.toFixed(1)}%)</div>
              )}
              {selectedInvoice.batchId && <div><strong>Batch:</strong> {selectedInvoice.batchId}</div>}
            </div>
            {selectedInvoice.aiDescription && (
              <div style={{ marginTop: 16, padding: 14, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 13 }}>
                <strong>Description:</strong> {selectedInvoice.aiDescription}
              </div>
            )}
            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" disabled={downloading === selectedInvoice.id}
                onClick={async () => {
                  setDownloading(selectedInvoice.id)
                  try {
                    const res = await fetch(`/api/invoices/${selectedInvoice.id}/pdf`)
                    if (!res.ok) throw new Error('PDF generation failed')
                    const blob = await res.blob()
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = `${selectedInvoice.invoiceNumber}.pdf`
                    a.click(); URL.revokeObjectURL(url)
                  } catch (err) { console.error('PDF error:', err) }
                  finally { setDownloading(null) }
                }}>
                {downloading === selectedInvoice.id ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating PDF...</> : <><Download size={14} /> Download PDF</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
