'use client'

import { motion } from 'framer-motion'
import {
  Briefcase, Crown, Film, Hotel, Map, User2, ShoppingBag, FileText,
  Plus, Eye, Edit3, Copy, Trash2, Star, Globe, QrCode, X, Save, Loader2
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

const iconMap: Record<string, any> = {
  Travel: Briefcase, 'Luxury Travel': Crown, Entertainment: Film,
  Hospitality: Hotel, 'Tour Operators': Map, Consulting: User2,
  'E-commerce': ShoppingBag, Any: FileText, General: FileText,
}
const colorMap: Record<string, string> = {
  Travel: '#6366F1', 'Luxury Travel': '#D97706', Entertainment: '#EC4899',
  Hospitality: '#F59E0B', 'Tour Operators': '#10B981', Consulting: '#8B5CF6',
  'E-commerce': '#EF4444', Any: '#64748B', General: '#64748B',
}

const categories = ['All', 'Travel', 'Entertainment', 'Hospitality', 'Consulting', 'E-commerce', 'Custom']

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('General')
  const [formQrEnabled, setFormQrEnabled] = useState(true)
  const [formLanguage, setFormLanguage] = useState('en')

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates')
      const json = await res.json()
      if (json.templates && json.templates.length > 0) {
        setTemplates(json.templates)
      } else {
        // Seed templates if empty
        await fetch('/api/templates/seed', { method: 'POST' })
        const res2 = await fetch('/api/templates')
        const json2 = await res2.json()
        setTemplates(json2.templates || [])
      }
    } catch (err) {
      console.error('Load templates error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTemplates() }, [loadTemplates])

  const filteredTemplates = activeCategory === 'All'
    ? templates
    : activeCategory === 'Custom'
    ? templates.filter(t => t.isCustom)
    : templates.filter(t => t.category === activeCategory || t.category?.includes(activeCategory))

  function openEditor(template?: any) {
    if (template) {
      setEditingTemplate(template)
      setFormName(template.name)
      setFormCategory(template.category || 'General')
      setFormQrEnabled(template.qrEnabled || false)
      setFormLanguage(template.defaultLanguageCode || 'en')
    } else {
      setEditingTemplate(null)
      setFormName('')
      setFormCategory('General')
      setFormQrEnabled(true)
      setFormLanguage('en')
    }
    setShowEditor(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        name: formName,
        category: formCategory,
        qrEnabled: formQrEnabled,
        defaultLanguageCode: formLanguage,
        isCustom: true,
      }

      if (editingTemplate) {
        await fetch(`/api/templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      setShowEditor(false)
      await loadTemplates()
    } catch (err) {
      console.error('Save template error:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this template?')) return
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      await loadTemplates()
    } catch (err) {
      console.error('Delete template error:', err)
    }
  }

  async function handleDuplicate(template: any) {
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          category: template.category,
          layoutConfig: template.layoutConfig,
          isCustom: true,
          qrEnabled: template.qrEnabled,
          defaultLanguageCode: template.defaultLanguageCode,
        }),
      })
      await loadTemplates()
    } catch (err) {
      console.error('Duplicate error:', err)
    }
  }

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Templates</h1>
            <p className="page-subtitle">Browse, preview, and customize invoice templates. {templates.length} template(s) available.</p>
          </div>
          <button className="btn btn-primary" onClick={() => openEditor()}>
            <Plus size={16} /> Create Template
          </button>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${cat === activeCategory ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '6px 16px' }}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Template Grid */}
      <motion.div variants={itemVariants} className="grid-3" style={{ gap: 16 }}>
        {filteredTemplates.map((template) => {
          const Icon = iconMap[template.category] || FileText
          const color = colorMap[template.category] || '#64748B'
          return (
            <div key={template.id} className="card card-interactive" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  height: 180,
                  background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', borderBottom: '1px solid var(--border-primary)',
                }}
              >
                <div style={{
                  width: '75%', height: '80%', background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)',
                  padding: 12, display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 4, background: `${color}20` }} />
                    <div style={{ fontSize: 7, fontWeight: 700, color }}>INVOICE</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div className="skeleton" style={{ width: '60%', height: 5 }} />
                    <div className="skeleton" style={{ width: '80%', height: 5 }} />
                    <div className="skeleton" style={{ width: '40%', height: 5 }} />
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                      <div className="skeleton" style={{ width: '30%', height: 8 }} />
                      <div style={{ fontSize: 8, fontWeight: 700, color }}>₹8,500</div>
                    </div>
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 4 }}>
                  {template.isPreset && <span className="badge badge-primary" style={{ fontSize: 10 }}>Preset</span>}
                  {template.isCustom && <span className="badge" style={{ fontSize: 10, background: '#FEF3C7', color: '#D97706' }}>Custom</span>}
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Icon size={16} color={color} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{template.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 12 }}>
                  <span className="badge" style={{ fontSize: 10, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    {template.category}
                  </span>
                  <span className="badge" style={{ fontSize: 10, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    <Globe size={9} /> {(template.defaultLanguageCode || 'en').toUpperCase()}
                  </span>
                  {template.qrEnabled && (
                    <span className="badge" style={{ fontSize: 10, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      <QrCode size={9} /> QR
                    </span>
                  )}
                </div>
                <div style={{
                  display: 'flex', gap: 6, paddingTop: 12,
                  borderTop: '1px solid var(--border-secondary)',
                }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => openEditor(template)}>
                    <Edit3 size={13} /> Edit
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDuplicate(template)}>
                    <Copy size={13} />
                  </button>
                  {!template.isPreset && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(template.id)}
                      style={{ color: 'var(--color-error)' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Create New Card */}
        <div
          className="card"
          onClick={() => openEditor()}
          style={{
            padding: 0, border: '2px dashed var(--border-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 320, cursor: 'pointer', transition: 'all var(--transition-fast)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 'var(--radius-lg)',
              background: 'var(--color-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', color: 'var(--color-primary)',
            }}>
              <Plus size={24} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Create Custom Template</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Design from scratch with the visual editor
            </div>
          </div>
        </div>
      </motion.div>

      {/* Template Editor Modal */}
      {showEditor && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowEditor(false)}>
          <div className="card" style={{ width: 520, maxHeight: '80vh', overflow: 'auto', padding: 28 }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600 }}>
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowEditor(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>
                  Template Name
                </label>
                <input
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
                    fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)',
                  }}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. My Custom Template"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>
                  Category
                </label>
                <select
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
                    fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)',
                  }}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {['General', 'Travel', 'Luxury Travel', 'Entertainment', 'Hospitality', 'Tour Operators', 'Consulting', 'E-commerce', 'Any'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>
                    Language
                  </label>
                  <select
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
                      fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)',
                    }}
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                  >
                    {[
                      { value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' },
                      { value: 'ta', label: 'Tamil' }, { value: 'fr', label: 'French' },
                      { value: 'es', label: 'Spanish' }, { value: 'de', label: 'German' },
                      { value: 'ar', label: 'Arabic' }, { value: 'ja', label: 'Japanese' },
                      { value: 'zh', label: 'Chinese' }, { value: 'pt', label: 'Portuguese' },
                      { value: 'ko', label: 'Korean' }, { value: 'ru', label: 'Russian' },
                    ].map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block', color: 'var(--text-secondary)' }}>
                    QR Code
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={formQrEnabled} onChange={(e) => setFormQrEnabled(e.target.checked)} />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Enable QR on invoices</span>
                  </label>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowEditor(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !formName}>
                {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
