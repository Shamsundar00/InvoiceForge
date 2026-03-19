'use client'

import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, Key, Building2, Palette, Calendar, Globe,
  Sparkles, FileText, Shield, ChevronRight, Save, Eye, EyeOff,
  CheckCircle2, AlertCircle, RefreshCw, X
} from 'lucide-react'
import { useState, useEffect } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [groqKey, setGroqKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Company info
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyGST, setCompanyGST] = useState('')

  // Tax
  const [defaultTaxRate, setDefaultTaxRate] = useState('18')
  const [taxLabel, setTaxLabel] = useState('GST')

  // Financial Year
  const [fyStartMonth, setFyStartMonth] = useState('4')
  const [invoicePrefix, setInvoicePrefix] = useState('INV')
  const [zeroPadding, setZeroPadding] = useState('4')

  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings')
      const json = await res.json()
      const s = json.settings || {}
      if (s.gemini_api_key) setApiKey(s.gemini_api_key)
      if (s.groq_api_key) setGroqKey(s.groq_api_key)
      if (s.openai_api_key) setOpenaiKey(s.openai_api_key)
      if (s.company_name) setCompanyName(s.company_name)
      if (s.company_address) setCompanyAddress(s.company_address)
      if (s.company_phone) setCompanyPhone(s.company_phone)
      if (s.company_email) setCompanyEmail(s.company_email)
      if (s.company_gst) setCompanyGST(s.company_gst)
      if (s.default_tax_rate) setDefaultTaxRate(s.default_tax_rate)
      if (s.tax_label) setTaxLabel(s.tax_label)
      if (s.fy_start_month) setFyStartMonth(s.fy_start_month)
      if (s.invoice_prefix) setInvoicePrefix(s.invoice_prefix)
      if (s.zero_padding) setZeroPadding(s.zero_padding)
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  async function saveSetting(key: string, value: string, category: string) {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, category }),
      })
    } catch (err) {
      console.error('Failed to save setting:', err)
    }
  }

  async function handleSaveApiKeys() {
    setSaving(true)
    setSaveSuccess(false)
    await Promise.all([
      saveSetting('gemini_api_key', apiKey, 'ai'),
      saveSetting('groq_api_key', groqKey, 'ai'),
      saveSetting('openai_api_key', openaiKey, 'ai'),
    ])
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  async function handleTestConnection() {
    setTesting(true)
    setTestResult(null)
    // Simple test: check if key format looks valid
    setTimeout(() => {
      if (apiKey.length > 10) {
        setTestResult('success')
      } else {
        setTestResult('error')
      }
      setTesting(false)
    }, 1500)
  }

  async function handleSaveCompanyInfo() {
    setSaving(true)
    await Promise.all([
      saveSetting('company_name', companyName, 'company'),
      saveSetting('company_address', companyAddress, 'company'),
      saveSetting('company_phone', companyPhone, 'company'),
      saveSetting('company_email', companyEmail, 'company'),
      saveSetting('company_gst', companyGST, 'company'),
    ])
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  async function handleSaveTax() {
    setSaving(true)
    await Promise.all([
      saveSetting('default_tax_rate', defaultTaxRate, 'tax'),
      saveSetting('tax_label', taxLabel, 'tax'),
    ])
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  async function handleSaveFY() {
    setSaving(true)
    await Promise.all([
      saveSetting('fy_start_month', fyStartMonth, 'financial_year'),
      saveSetting('invoice_prefix', invoicePrefix, 'financial_year'),
      saveSetting('zero_padding', zeroPadding, 'financial_year'),
    ])
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const settingsSections = [
    { id: 'company', title: 'Company Information', icon: Building2, desc: 'Set your company name, address, logo, and contact details', color: '#6366F1', status: companyName ? 'Configured' : 'Incomplete', statusType: companyName ? 'success' : 'warning' },
    { id: 'tax', title: 'Tax & Pricing', icon: FileText, desc: 'Configure default tax rates, discounts, and cost settings', color: '#10B981', status: `${taxLabel} ${defaultTaxRate}%`, statusType: 'success' },
    { id: 'fy', title: 'Financial Year', icon: Calendar, desc: 'Set financial year start month and invoice numbering format', color: '#F59E0B', status: `Starts ${months[parseInt(fyStartMonth) - 1]}`, statusType: 'success' },
    { id: 'language', title: 'Language Packs', icon: Globe, desc: 'Manage invoice label translations', color: '#3B82F6', status: '12 preset languages', statusType: 'info' },
    { id: 'branding', title: 'White-Label Branding', icon: Palette, desc: 'Customize application name, colors, and branding', color: '#EC4899', status: 'Default', statusType: 'info' },
    { id: 'security', title: 'Security', icon: Shield, desc: 'Password and encryption settings', color: '#EF4444', status: 'Active', statusType: 'success' },
  ]

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
    fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none',
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your InvoiceForge application.</p>
      </motion.div>

      {/* Success toast */}
      {saveSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '10px 16px', background: 'var(--color-success-light)', borderRadius: 'var(--radius-md)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-success)', fontWeight: 500 }}>
          <CheckCircle2 size={15} /> Settings saved successfully
        </motion.div>
      )}

      {/* API Key */}
      <motion.div variants={itemVariants} style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: 20, border: '1px solid var(--color-primary-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} color="#8B5CF6" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>AI Provider API Keys</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Add your API key for any supported AI provider (Gemini, Groq, or OpenAI). The first available key will be used.</div>
            </div>
            {(apiKey || groqKey || openaiKey) && (
              <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                ✓ {apiKey ? 'Gemini' : groqKey ? 'Groq' : 'OpenAI'} Active
              </span>
            )}
          </div>

          {/* Gemini */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Google Gemini API Key</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0 12px', border: '1px solid var(--border-primary)' }}>
              <input type={showKey ? 'text' : 'password'} placeholder="Enter your Gemini API key..."
                value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '10px 0', fontSize: 13, fontFamily: 'monospace', color: 'var(--text-primary)' }} />
            </div>
          </div>

          {/* Groq */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Groq API Key <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(free tier available)</span></label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0 12px', border: '1px solid var(--border-primary)' }}>
              <input type={showKey ? 'text' : 'password'} placeholder="Enter your Groq API key..."
                value={groqKey} onChange={(e) => setGroqKey(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '10px 0', fontSize: 13, fontFamily: 'monospace', color: 'var(--text-primary)' }} />
            </div>
          </div>

          {/* OpenAI */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>OpenAI API Key</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0 12px', border: '1px solid var(--border-primary)' }}>
              <input type={showKey ? 'text' : 'password'} placeholder="Enter your OpenAI API key..."
                value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '10px 0', fontSize: 13, fontFamily: 'monospace', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowKey(!showKey)}>
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              {showKey ? 'Hide' : 'Show'} Keys
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSaveApiKeys} disabled={saving}>
              <Save size={14} /> Save All Keys
            </button>
          </div>
        </div>
      </motion.div>

      {/* Settings Sections */}
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {settingsSections.map((section) => {
            const Icon = section.icon
            const isOpen = activeSection === section.id
            return (
              <div key={section.id}>
                <div className="card card-interactive" style={{ padding: 18, cursor: 'pointer' }}
                  onClick={() => setActiveSection(isOpen ? null : section.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: `${section.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={section.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{section.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{section.desc}</div>
                    </div>
                    <span className={`badge ${section.statusType === 'success' ? 'badge-success' : section.statusType === 'warning' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: 11 }}>
                      {section.status}
                    </span>
                    <ChevronRight size={16} color="var(--text-tertiary)" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && section.id === 'company' && (
                  <div className="card" style={{ padding: 20, marginTop: 4, borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>Company Name</label>
                        <input style={inputStyle} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company Name" />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>GST / Tax ID</label>
                        <input style={inputStyle} value={companyGST} onChange={(e) => setCompanyGST(e.target.value)} placeholder="e.g. 29AABCU9603R1ZM" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>Address</label>
                        <input style={inputStyle} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Full company address" />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>Phone</label>
                        <input style={inputStyle} value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="+91 98765 43210" />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>Email</label>
                        <input style={inputStyle} value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="billing@yourcompany.com" />
                      </div>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary btn-sm" onClick={handleSaveCompanyInfo} disabled={saving}>
                        <Save size={14} /> Save Company Info
                      </button>
                    </div>
                  </div>
                )}

                {isOpen && section.id === 'tax' && (
                  <div className="card" style={{ padding: 20, marginTop: 4, borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>Tax Label</label>
                        <input style={inputStyle} value={taxLabel} onChange={(e) => setTaxLabel(e.target.value)} placeholder="GST, VAT, Tax" />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>Default Tax Rate (%)</label>
                        <input style={inputStyle} type="number" value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(e.target.value)} placeholder="18" />
                      </div>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary btn-sm" onClick={handleSaveTax} disabled={saving}>
                        <Save size={14} /> Save Tax Settings
                      </button>
                    </div>
                  </div>
                )}

                {isOpen && section.id === 'fy' && (
                  <div className="card" style={{ padding: 20, marginTop: 4, borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>FY Start Month</label>
                        <select style={inputStyle} value={fyStartMonth} onChange={(e) => setFyStartMonth(e.target.value)}>
                          {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>Invoice Prefix</label>
                        <input style={inputStyle} value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} placeholder="INV" />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>Zero Padding</label>
                        <select style={inputStyle} value={zeroPadding} onChange={(e) => setZeroPadding(e.target.value)}>
                          <option value="3">3 digits (001)</option>
                          <option value="4">4 digits (0001)</option>
                          <option value="5">5 digits (00001)</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)' }}>
                      Preview: <strong style={{ color: 'var(--color-primary)' }}>
                        {invoicePrefix}-2025-26-{'0'.repeat(parseInt(zeroPadding) - 1)}1
                      </strong>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary btn-sm" onClick={handleSaveFY} disabled={saving}>
                        <Save size={14} /> Save FY Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
