'use client'

import { motion } from 'framer-motion'
import {
  BarChart3, Download, PieChart, TrendingUp, DollarSign, AlertTriangle,
  Loader2, ArrowUpRight, ArrowDownRight, FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export default function AuditPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/audit')
        const json = await res.json()
        setAnalytics(json.analytics || null)
        setLogs(json.logs || [])
      } catch (err) {
        console.error('Load audit error:', err)
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

  const auditStats = [
    { label: 'Gross Revenue', value: analytics ? formatCurrency(analytics.grossRevenue) : '₹0', icon: DollarSign, color: '#10B981', bg: '#D1FAE5' },
    { label: 'Total Profit', value: analytics ? formatCurrency(analytics.totalProfit) : '₹0', icon: TrendingUp, color: '#6366F1', bg: '#EEF2FF' },
    { label: 'Avg Margin', value: analytics ? `${analytics.avgMargin.toFixed(1)}%` : '—', icon: BarChart3, color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Error Count', value: analytics ? String(analytics.errorCount) : '0', icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2' },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Audit & Reports</h1>
            <p className="page-subtitle">Financial analytics and comprehensive audit reports.</p>
          </div>
          <button className="btn btn-primary btn-sm"><Download size={14} /> Download Audit Excel</button>
        </div>
      </motion.div>

      {/* Audit Stats */}
      <motion.div variants={itemVariants} className="grid-stats" style={{ marginBottom: 24 }}>
        {auditStats.map(s => (
          <div key={s.label} className="stat-card" style={{ '--stat-color': s.color } as React.CSSProperties}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Category Breakdown & Status */}
      <motion.div variants={itemVariants} className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart3 size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Revenue by Category</h3>
          </div>
          {analytics?.categoryBreakdown?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analytics.categoryBreakdown.map((cat: any, i: number) => {
                const maxRev = Math.max(...analytics.categoryBreakdown.map((c: any) => c.revenue))
                const pct = maxRev > 0 ? (cat.revenue / maxRev) * 100 : 0
                const barColors = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444']
                return (
                  <div key={cat.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(cat.revenue)} ({cat.count})</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: barColors[i % barColors.length],
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
              Generate invoices to see category breakdown
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <PieChart size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Invoice Status</h3>
          </div>
          {analytics?.statusBreakdown?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analytics.statusBreakdown.map((s: any) => {
                const statusColors: Record<string, string> = { generated: '#10B981', error: '#EF4444', draft: '#F59E0B', superseded: '#64748B' }
                return (
                  <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 'var(--radius-full)', background: statusColors[s.status] || '#64748B' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{s.status}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.count}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
              Status breakdown will appear here
            </div>
          )}
        </div>
      </motion.div>

      {/* Top Invoices */}
      {analytics?.topInvoices?.length > 0 && (
        <motion.div variants={itemVariants} className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ArrowUpRight size={18} color="#10B981" />
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Highest Profit Invoices</h3>
            </div>
            {analytics.topInvoices.map((inv: any) => (
              <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-secondary)', fontSize: 13 }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{inv.invoiceNumber}</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>{inv.customerName}</span>
                </div>
                <span style={{ fontWeight: 600, color: '#10B981' }}>{formatCurrency(inv.marginAmount || 0)}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ArrowDownRight size={18} color="#EF4444" />
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Lowest Profit Invoices</h3>
            </div>
            {analytics.bottomInvoices?.map((inv: any) => (
              <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-secondary)', fontSize: 13 }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{inv.invoiceNumber}</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>{inv.customerName}</span>
                </div>
                <span style={{ fontWeight: 600, color: '#EF4444' }}>{formatCurrency(inv.marginAmount || 0)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Audit Log */}
      <motion.div variants={itemVariants}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FileText size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Audit Trail</h3>
          </div>
          {logs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {logs.slice(0, 20).map((log: any) => (
                <div key={log.id} className="activity-item">
                  <div className="activity-dot" style={{
                    background: log.actionType === 'generate' ? 'var(--color-success)'
                      : log.actionType === 'upload' ? 'var(--color-primary)'
                      : log.actionType === 'delete' ? 'var(--color-error)'
                      : 'var(--text-tertiary)',
                  }} />
                  <div className="activity-content">
                    <div className="activity-text">{log.actionDetail}</div>
                    <div className="activity-time">
                      {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
              No audit logs yet. Generate invoices to create audit records.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
