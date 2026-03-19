'use client'

import { motion } from 'framer-motion'
import {
  FileSpreadsheet, Zap, Palette, Download, Upload, TrendingUp,
  DollarSign, BarChart3, Sparkles, ArrowUpRight, Clock,
  CheckCircle2, ChevronRight, RefreshCw
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

interface DashboardStats {
  totalInvoices: number
  totalRevenue: number
  totalProfit: number
  avgMargin: number
  aiConfigured: boolean
  activeSourceName: string | null
  activeSourceRows: number
}

interface ActivityItem {
  id: string
  actionType: string
  actionDetail: string
  timestamp: string
}

const actionIcons: Record<string, typeof Upload> = {
  upload: Upload, generate: Zap, export: Download,
  settings_change: Sparkles, delete: RefreshCw, backup: Download,
}

const quickActions = [
  { label: 'Upload Excel', icon: Upload, href: '/data-source', shortcut: 'Ctrl+U', color: '#6366F1' },
  { label: 'Generate Invoices', icon: Zap, href: '/generate', shortcut: 'Ctrl+G', color: '#8B5CF6' },
  { label: 'Create Template', icon: Palette, href: '/templates', color: '#EC4899' },
  { label: 'Export All', icon: Download, href: '/gallery', shortcut: 'Ctrl+E', color: '#10B981' },
]

const gettingStarted = [
  { step: 1, label: 'Upload your Excel data source', href: '/data-source', key: 'source' },
  { step: 2, label: 'Choose or customize a template', href: '/templates', key: 'template' },
  { step: 3, label: 'Configure AI descriptions (optional)', href: '/settings', key: 'ai' },
  { step: 4, label: 'Preview and generate invoices', href: '/generate', key: 'generate' },
  { step: 5, label: 'Download audit reports', href: '/audit', key: 'audit' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/dashboard')
        const json = await res.json()
        setStats(json.stats || null)
        setActivity(json.recentActivity || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const completedSteps = stats ? {
    source: !!stats.activeSourceName,
    template: false,
    ai: stats.aiConfigured,
    generate: stats.totalInvoices > 0,
    audit: false,
  } : {} as Record<string, boolean>

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const statCards = stats ? [
    { label: 'Total Invoices', value: stats.totalInvoices.toLocaleString(), icon: FileSpreadsheet, color: '#6366F1', bg: '#EEF2FF' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: '#10B981', bg: '#D1FAE5' },
    { label: 'Total Profit', value: formatCurrency(stats.totalProfit), icon: TrendingUp, color: '#8B5CF6', bg: '#EDE9FE' },
    { label: 'AI Status', value: stats.aiConfigured ? 'Connected' : 'Not Configured', icon: Sparkles, color: stats.aiConfigured ? '#10B981' : '#F59E0B', bg: stats.aiConfigured ? '#D1FAE5' : '#FEF3C7' },
  ] : []

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="page-header">
        <h1 className="page-title">Welcome back! 👋</h1>
        <p className="page-subtitle">
          {stats?.activeSourceName
            ? `Currently working with: ${stats.activeSourceName} (${stats.activeSourceRows} rows)`
            : 'Get started by uploading an Excel file.'}
        </p>
      </motion.div>

      {/* Stat Cards */}
      {!loading && (
        <motion.div variants={itemVariants} className="grid-stats" style={{ marginBottom: 24 }}>
          {statCards.map((card) => (
            <div key={card.label} className="stat-card" style={{ '--stat-color': card.color } as React.CSSProperties}>
              <div className="stat-icon" style={{ background: card.bg }}>
                <card.icon size={22} color={card.color} />
              </div>
              <div className="stat-content">
                <div className="stat-label">{card.label}</div>
                <div className="stat-value" style={{ fontSize: card.label === 'AI Status' ? 16 : undefined }}>{card.value}</div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href} style={{ textDecoration: 'none', flex: 1, minWidth: 180 }}>
            <div className="card card-interactive" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <action.icon size={18} color={action.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{action.label}</div>
              </div>
              {action.shortcut && (
                <span className="search-kbd" style={{ fontSize: 10 }}>{action.shortcut}</span>
              )}
            </div>
          </Link>
        ))}
      </motion.div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Getting Started */}
        <motion.div variants={itemVariants}>
          <div className="card" style={{ padding: 24, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Zap size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Getting Started</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {gettingStarted.map((step) => {
                const done = completedSteps[step.key]
                return (
                  <Link key={step.step} href={step.href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                      borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      background: done ? 'var(--color-success-light)' : 'transparent',
                      transition: 'background var(--transition-fast)',
                    }} className="card-interactive">
                      <div style={{
                        width: 28, height: 28, borderRadius: 'var(--radius-full)',
                        background: done ? 'var(--color-success)' : 'var(--color-primary-light)',
                        color: done ? 'white' : 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                      }}>
                        {done ? <CheckCircle2 size={14} /> : step.step}
                      </div>
                      <span style={{
                        fontSize: 14, flex: 1,
                        color: done ? 'var(--color-success)' : 'var(--text-primary)',
                        textDecoration: done ? 'line-through' : 'none',
                      }}>
                        {step.label}
                      </span>
                      <ArrowUpRight size={14} color="var(--text-tertiary)" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <div className="card" style={{ padding: 24, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Activity</h3>
              </div>
            </div>
            {activity.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <div className="empty-state-icon" style={{ width: 48, height: 48 }}><Clock size={20} /></div>
                <div className="empty-state-title" style={{ fontSize: 14 }}>No activity yet</div>
                <div className="empty-state-text" style={{ fontSize: 12, marginBottom: 12 }}>
                  Your recent invoice generation activity will appear here. Start by uploading an Excel file.
                </div>
                <Link href="/data-source" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                  <Upload size={14} /> Upload Excel
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {activity.map((item) => {
                  const Icon = actionIcons[item.actionType] || Clock
                  return (
                    <div key={item.id} className="activity-item">
                      <div className="activity-dot" style={{
                        background: item.actionType === 'upload' ? 'var(--color-primary)' :
                          item.actionType === 'generate' ? 'var(--color-success)' :
                          item.actionType === 'delete' ? 'var(--color-error)' : 'var(--text-tertiary)'
                      }} />
                      <div className="activity-content">
                        <div className="activity-text">{item.actionDetail}</div>
                        <div className="activity-time">
                          {new Date(item.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
