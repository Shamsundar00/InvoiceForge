'use client'

import { motion } from 'framer-motion'
import {
  Zap, FileSpreadsheet, Palette, Settings, Sparkles, Eye, Play,
  ChevronRight, CheckCircle2, AlertCircle, Info, DollarSign, Clock, Hash,
  Loader2, ArrowLeft, ArrowRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

const steps = [
  { id: 1, label: 'Data Source', icon: FileSpreadsheet },
  { id: 2, label: 'Template', icon: Palette },
  { id: 3, label: 'Settings', icon: Settings },
  { id: 4, label: 'AI Descriptions', icon: Sparkles },
  { id: 5, label: 'Preview', icon: Eye },
  { id: 6, label: 'Generate', icon: Play },
]

export default function GeneratePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [source, setSource] = useState<any>(null)
  const [sourceData, setSourceData] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Generation settings
  const [taxRate, setTaxRate] = useState(18)
  const [discountRate, setDiscountRate] = useState(0)
  const [enableQR, setEnableQR] = useState(true)
  const [enableAI, setEnableAI] = useState(false)
  const [paperSize, setPaperSize] = useState('A4')

  // Generation state
  const [generating, setGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<any>(null)
  const [aiDescriptions, setAiDescriptions] = useState<any[]>([])
  const [generatingAI, setGeneratingAI] = useState(false)
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      try {
        const [sourceRes, templatesRes, settingsRes] = await Promise.all([
          fetch('/api/source'),
          fetch('/api/templates'),
          fetch('/api/settings'),
        ])
        const sourceJson = await sourceRes.json()
        const templatesJson = await templatesRes.json()
        const settingsJson = await settingsRes.json()

        if (sourceJson.source) {
          setSource(sourceJson.source)
          setSourceData(sourceJson.data || [])
        }

        let tpls = templatesJson.templates || []
        if (tpls.length === 0) {
          await fetch('/api/templates/seed', { method: 'POST' })
          const res2 = await fetch('/api/templates')
          const j2 = await res2.json()
          tpls = j2.templates || []
        }
        setTemplates(tpls)
        if (tpls.length > 0) setSelectedTemplateId(tpls[0].id)

        const s = settingsJson.settings || {}
        if (s.default_tax_rate) setTaxRate(parseFloat(s.default_tax_rate))
      } catch (err) {
        console.error('Load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleGenerateAI() {
    if (!source || sourceData.length === 0) return
    setGeneratingAI(true)
    try {
      const rows = sourceData.slice(0, 10).map((row, i) => ({
        index: i,
        firstName: row.first_name || row.firstName || '',
        lastName: row.last_name || row.lastName || '',
        category: row.category || '',
        amount: row.amount || row.total_cost || row.ticket_cost || '',
        description: row.description || '',
      }))
      const res = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const json = await res.json()
      setAiDescriptions(json.descriptions || [])
    } catch (err) {
      console.error('AI error:', err)
    } finally {
      setGeneratingAI(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    setGenerationResult(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          taxRate,
          discountRate,
          enableQR,
          enableAI,
          paperSize,
          hiddenColumns: Array.from(hiddenColumns),
        }),
      })
      const json = await res.json()
      if (json.success) {
        setGenerationResult(json)
      } else {
        setGenerationResult({ error: json.error })
      }
    } catch (err) {
      setGenerationResult({ error: 'Generation failed. Please try again.' })
    } finally {
      setGenerating(false)
    }
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
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
        <h1 className="page-title">Generate Invoices</h1>
        <p className="page-subtitle">Follow the steps to configure and generate your invoices.</p>
      </motion.div>

      {/* Step Progress */}
      <motion.div variants={itemVariants}>
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {steps.map((step, i) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              return (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                      borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                      background: isActive ? 'var(--color-primary-light)' : 'transparent',
                      color: isActive ? 'var(--color-primary)' : isCompleted ? 'var(--color-success)' : 'var(--text-tertiary)',
                      fontWeight: isActive ? 600 : 500, fontSize: 13, fontFamily: 'inherit',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-full)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isCompleted ? 'var(--color-success-light)' : isActive ? 'var(--color-primary)' : 'var(--bg-secondary)',
                      color: isActive ? 'white' : isCompleted ? 'var(--color-success)' : 'var(--text-tertiary)',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {isCompleted ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                    </div>
                    <span className="hide-mobile">{step.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, margin: '0 4px',
                      background: isCompleted ? 'var(--color-success)' : 'var(--border-primary)',
                      borderRadius: 'var(--radius-full)',
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Step Content */}
      <motion.div variants={itemVariants}>
        {/* Step 1: Data Source */}
        {currentStep === 1 && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <FileSpreadsheet size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: 17, fontWeight: 600 }}>Step 1: Confirm Data Source</h3>
            </div>
            {source ? (
              <div>
                <div className="card" style={{ padding: 16, background: 'var(--color-success-light)', border: '1px solid #86EFAC', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={16} color="var(--color-success)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{source.fileName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {source.rowCount} rows • {source.columnCount} columns • Status: {source.validationStatus}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Preview of first 5 rows — click 👁 to show/hide columns on the invoice:</span>
                  {hiddenColumns.size > 0 && (
                    <span style={{ fontSize: 11, background: 'var(--color-warning-light)', color: 'var(--color-warning)', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                      {hiddenColumns.size} column(s) hidden
                    </span>
                  )}
                </div>
                <div style={{ overflowX: 'auto', maxHeight: 300, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        {Object.keys(sourceData[0] || {}).map(h => {
                          const isHidden = hiddenColumns.has(h)
                          return (
                            <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border-primary)', opacity: isHidden ? 0.4 : 1, position: 'relative', minWidth: 90 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <button
                                  onClick={() => {
                                    setHiddenColumns(prev => {
                                      const next = new Set(prev)
                                      if (next.has(h)) next.delete(h); else next.add(h)
                                      return next
                                    })
                                  }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14, color: isHidden ? 'var(--color-error)' : 'var(--color-success)' }}
                                  title={isHidden ? `Show "${h}" on invoice` : `Hide "${h}" from invoice`}
                                >
                                  {isHidden ? '🚫' : '👁'}
                                </button>
                                <span style={{ textDecoration: isHidden ? 'line-through' : 'none' }}>{h}</span>
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {sourceData.slice(0, 5).map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                          {Object.keys(row).map(k => (
                            <td key={k} style={{ padding: '6px 10px', whiteSpace: 'nowrap', opacity: hiddenColumns.has(k) ? 0.3 : 1 }}>{String(row[k])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-icon"><FileSpreadsheet size={24} /></div>
                <div className="empty-state-title">No data source loaded</div>
                <div className="empty-state-text">Upload an Excel file in the Data Source page first.</div>
                <Link href="/data-source" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                  Go to Data Source
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Template */}
        {currentStep === 2 && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Palette size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: 17, fontWeight: 600 }}>Step 2: Select Template</h3>
            </div>
            <div className="grid-3" style={{ gap: 12 }}>
              {templates.map(t => (
                <div key={t.id}
                  className={`card card-interactive`}
                  onClick={() => setSelectedTemplateId(t.id)}
                  style={{
                    padding: 16, cursor: 'pointer', textAlign: 'center',
                    border: selectedTemplateId === t.id ? '2px solid var(--color-primary)' : '1px solid var(--border-primary)',
                    background: selectedTemplateId === t.id ? 'var(--color-primary-light)' : undefined,
                  }}
                >
                  <div style={{
                    height: 60, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                    marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Palette size={20} color={selectedTemplateId === t.id ? 'var(--color-primary)' : 'var(--text-tertiary)'} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{t.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {currentStep === 3 && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Settings size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: 17, fontWeight: 600 }}>Step 3: Configure Settings</h3>
            </div>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="card" style={{ padding: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
                  <DollarSign size={13} style={{ verticalAlign: 'middle' }} /> Tax Rate (%)
                </label>
                <input type="number" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)' }} />
              </div>
              <div className="card" style={{ padding: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
                  <DollarSign size={13} style={{ verticalAlign: 'middle' }} /> Discount Rate (%)
                </label>
                <input type="number" value={discountRate} onChange={e => setDiscountRate(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)' }} />
              </div>
              <div className="card" style={{ padding: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
                  <FileSpreadsheet size={13} style={{ verticalAlign: 'middle' }} /> Paper Size
                </label>
                <select value={paperSize} onChange={e => setPaperSize(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)' }}>
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="A5">A5 (148 × 210 mm)</option>
                  <option value="Letter">US Letter (8.5 × 11 in)</option>
                  <option value="Legal">US Legal (8.5 × 14 in)</option>
                </select>
              </div>
              <div className="card" style={{ padding: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block', color: 'var(--text-secondary)' }}>
                  Options
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}>
                  <input type="checkbox" checked={enableQR} onChange={e => setEnableQR(e.target.checked)} />
                  <span style={{ fontSize: 13 }}>Enable QR codes on invoices</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: AI Descriptions */}
        {currentStep === 4 && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Sparkles size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: 17, fontWeight: 600 }}>Step 4: AI Description Generation</h3>
            </div>
            <div className="card" style={{ padding: 16, background: 'var(--color-info-light)', border: '1px solid #93C5FD', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={16} color="var(--color-info)" />
                <div style={{ fontSize: 13, color: '#1E40AF' }}>
                  <strong>Estimate:</strong> ~{sourceData.length} invoices • ~{sourceData.length * 300} tokens • ~${(sourceData.length * 300 * 0.0000005).toFixed(4)} USD
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button className="btn btn-primary" onClick={() => { setEnableAI(true); handleGenerateAI() }} disabled={generatingAI}>
                {generatingAI ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                {generatingAI ? 'Generating...' : 'Generate AI Descriptions'}
              </button>
              <button className="btn btn-secondary" onClick={() => setEnableAI(false)}>Skip AI</button>
            </div>
            {aiDescriptions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Preview (first 10):</div>
                {aiDescriptions.slice(0, 5).map((d, i) => (
                  <div key={i} className="card" style={{ padding: 12, fontSize: 13 }}>
                    <span className="badge badge-primary" style={{ fontSize: 10, marginRight: 8 }}>Row {d.index + 1}</span>
                    <span className="badge" style={{ fontSize: 10, marginRight: 8, background: d.source === 'ai' ? '#D1FAE5' : '#FEF3C7', color: d.source === 'ai' ? '#059669' : '#D97706' }}>
                      {d.source === 'ai' ? '✨ AI' : '📝 Template'}
                    </span>
                    {d.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Preview */}
        {currentStep === 5 && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Eye size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: 17, fontWeight: 600 }}>Step 5: Dry Run Preview</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
              Preview of how your invoices will be generated.
            </p>
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><strong>Source:</strong> {source?.fileName || 'None'}</div>
                <div><strong>Rows:</strong> {sourceData.length}</div>
                <div><strong>Template:</strong> {selectedTemplate?.name || 'Default'}</div>
                <div><strong>Tax:</strong> {taxRate}%</div>
                <div><strong>Discount:</strong> {discountRate}%</div>
                <div><strong>QR Code:</strong> {enableQR ? 'Enabled' : 'Disabled'}</div>
                <div><strong>AI:</strong> {enableAI ? 'Enabled' : 'Disabled'}</div>
                <div><strong>Paper:</strong> {paperSize}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '12px 0' }}>
              {['Template applied', 'Numbers sequential', 'Calculations ready', enableQR ? 'QR codes enabled' : 'QR disabled'].map(c => (
                <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-success)' }}>
                  <CheckCircle2 size={13} /> {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Generate */}
        {currentStep === 6 && (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
              <Play size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: 17, fontWeight: 600 }}>Step 6: Generate Invoices</h3>
            </div>

            {!generationResult && !generating && (
              <>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 8 }}>
                  {sourceData.length}
                </div>
                <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 24 }}>invoices ready to generate</div>
                <button
                  className="btn btn-primary btn-lg animate-pulse-glow"
                  style={{ fontSize: 16, padding: '16px 40px' }}
                  onClick={handleGenerate}
                  disabled={!source}
                >
                  <Zap size={18} /> Generate All Invoices
                </button>
              </>
            )}

            {generating && (
              <div style={{ padding: 40 }}>
                <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)', marginBottom: 16 }} />
                <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Generating invoices...</div>
              </div>
            )}

            {generationResult && !generationResult.error && (
              <div>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-success)', marginBottom: 16 }}>
                  Generation Complete!
                </div>
                <div className="grid-3" style={{ gap: 12, marginBottom: 24, textAlign: 'center' }}>
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-success)' }}>{generationResult.summary.successful}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Successful</div>
                  </div>
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: generationResult.summary.errors > 0 ? 'var(--color-error)' : 'var(--text-tertiary)' }}>
                      {generationResult.summary.errors}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Errors</div>
                  </div>
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)' }}>
                      {formatCurrency(generationResult.summary.totalRevenue)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Revenue</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <Link href="/gallery" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    View in Gallery
                  </Link>
                  <Link href="/audit" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                    View Audit Report
                  </Link>
                </div>
              </div>
            )}

            {generationResult?.error && (
              <div className="card" style={{ padding: 16, background: '#FEE2E2', border: '1px solid #FECACA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626' }}>
                  <AlertCircle size={16} />
                  <span style={{ fontWeight: 600 }}>{generationResult.error}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Step Navigation */}
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1} style={{ opacity: currentStep === 1 ? 0.5 : 1 }}>
            <ArrowLeft size={14} /> Previous
          </button>
          <button className="btn btn-primary" onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
            disabled={currentStep === 6} style={{ opacity: currentStep === 6 ? 0.5 : 1 }}>
            Next Step <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
