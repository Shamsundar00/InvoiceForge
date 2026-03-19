'use client'

import { motion } from 'framer-motion'
import {
  Database, Download, Upload, Clock, Shield, HardDrive, Calendar,
  RefreshCw, CheckCircle2, Loader2, Trash2, FileText
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BackupPage() {
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupSuccess, setBackupSuccess] = useState(false)

  const loadBackups = useCallback(async () => {
    try {
      const res = await fetch('/api/backup')
      const json = await res.json()
      setBackups(json.backups || [])
    } catch (err) {
      console.error('Load backups error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadBackups() }, [loadBackups])

  async function handleCreateBackup() {
    setIsBackingUp(true)
    setBackupSuccess(false)
    try {
      const res = await fetch('/api/backup', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setBackupSuccess(true)
        setTimeout(() => setBackupSuccess(false), 4000)
        await loadBackups()
      }
    } catch (err) {
      console.error('Backup error:', err)
    } finally {
      setIsBackingUp(false)
    }
  }

  async function handleDeleteBackup(id: string) {
    if (!confirm('Delete this backup?')) return
    try {
      await fetch(`/api/backup?id=${id}`, { method: 'DELETE' })
      await loadBackups()
    } catch (err) {
      console.error('Delete backup error:', err)
    }
  }

  const lastBackup = backups.length > 0 ? backups[0] : null

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="page-header">
        <h1 className="page-title">Backup & Restore</h1>
        <p className="page-subtitle">Manage your application data backups.</p>
      </motion.div>

      {/* Success toast */}
      {backupSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '10px 16px', background: 'var(--color-success-light)', borderRadius: 'var(--radius-md)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-success)', fontWeight: 500 }}>
          <CheckCircle2 size={15} /> Backup created successfully!
        </motion.div>
      )}

      {/* Backup Status */}
      <motion.div variants={itemVariants} className="grid-stats" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--stat-color': '#10B981' } as React.CSSProperties}>
          <div className="stat-icon" style={{ background: '#D1FAE5' }}><Shield size={22} color="#10B981" /></div>
          <div className="stat-content">
            <div className="stat-label">Last Backup</div>
            <div className="stat-value" style={{ fontSize: 14 }}>
              {lastBackup
                ? new Date(lastBackup.createdDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                : 'Never'}
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#6366F1' } as React.CSSProperties}>
          <div className="stat-icon" style={{ background: '#EEF2FF' }}><HardDrive size={22} color="#6366F1" /></div>
          <div className="stat-content">
            <div className="stat-label">Total Backups</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{backups.length}</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#F59E0B' } as React.CSSProperties}>
          <div className="stat-icon" style={{ background: '#FEF3C7' }}><Calendar size={22} color="#F59E0B" /></div>
          <div className="stat-content">
            <div className="stat-label">Total Size</div>
            <div className="stat-value" style={{ fontSize: 18 }}>
              {formatBytes(backups.reduce((s, b) => s + (b.fileSizeBytes || 0), 0))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div variants={itemVariants} className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--color-primary)' }}>
            <Database size={24} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Create Backup</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Back up all data including invoices, templates, settings, and audit reports.
          </p>
          <button className="btn btn-primary" onClick={handleCreateBackup} disabled={isBackingUp}>
            {isBackingUp ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</> : <><Download size={14} /> Create Backup Now</>}
          </button>
        </div>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#F59E0B' }}>
            <Upload size={24} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Restore from Backup</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Upload a backup file to restore all your application data.
          </p>
          <button className="btn btn-secondary"><Upload size={14} /> Upload Backup File</button>
        </div>
      </motion.div>

      {/* Backup History */}
      <motion.div variants={itemVariants}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Backup History</h3>
          {backups.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <div className="empty-state-icon" style={{ width: 48, height: 48 }}><Database size={20} /></div>
              <div className="empty-state-title" style={{ fontSize: 14 }}>No backups yet</div>
              <div className="empty-state-text" style={{ fontSize: 12 }}>Create your first backup to protect your data.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {backups.map((backup) => (
                <div key={backup.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: backup.status === 'completed' ? '#D1FAE5' : '#FEE2E2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <FileText size={18} color={backup.status === 'completed' ? '#059669' : '#DC2626'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{backup.fileName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {new Date(backup.createdDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      {' • '}{formatBytes(backup.fileSizeBytes || 0)}
                      {' • '}{backup.invoiceCount || 0} invoices, {backup.templateCount || 0} templates
                    </div>
                  </div>
                  <span className="badge" style={{
                    fontSize: 10,
                    background: backup.status === 'completed' ? '#D1FAE5' : '#FEE2E2',
                    color: backup.status === 'completed' ? '#059669' : '#DC2626',
                  }}>
                    {backup.status}
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteBackup(backup.id)}
                    style={{ color: 'var(--color-error)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
