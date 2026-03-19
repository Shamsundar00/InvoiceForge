'use client'

import { motion } from 'framer-motion'
import {
  Clock, Download, FileText, RefreshCw, Loader2,
  CheckCircle2, AlertCircle, Zap, ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export default function HistoryPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/history')
        const json = await res.json()
        setBatches(json.batches || [])
      } catch (err) {
        console.error('Load history error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="page-header">
        <h1 className="page-title">Generation History</h1>
        <p className="page-subtitle">Log of all invoice generation batches. {batches.length > 0 && `${batches.length} batch(es)`}</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        {batches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Clock size={28} /></div>
            <div className="empty-state-title">No generation history</div>
            <div className="empty-state-text">
              Your invoice generation batches will appear here with timestamps, counts, and details.
            </div>
            <Link href="/generate" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <Zap size={14} /> Generate Invoices
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {batches.map((batch) => (
              <div key={batch.id} className="card card-interactive" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Status indicator */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: batch.errorCount > 0 ? '#FEF3C7' : '#D1FAE5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {batch.errorCount > 0 ? (
                      <AlertCircle size={20} color="#D97706" />
                    ) : (
                      <CheckCircle2 size={20} color="#059669" />
                    )}
                  </div>

                  {/* Batch info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{batch.batchId}</span>
                      {batch.source && (
                        <span className="badge" style={{ fontSize: 10, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                          {batch.source.fileName}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {new Date(batch.generationDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      {batch.template && ` • Template: ${batch.template.name}`}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-success)' }}>{batch.successfulCount || 0}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Success</div>
                    </div>
                    {batch.errorCount > 0 && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-error)' }}>{batch.errorCount}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Errors</div>
                      </div>
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
                        {formatCurrency(batch.totalRevenue || 0)}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Revenue</div>
                    </div>
                    <Link href={`/gallery?batch=${batch.batchId}`} style={{ textDecoration: 'none' }}>
                      <ChevronRight size={16} color="var(--text-tertiary)" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
