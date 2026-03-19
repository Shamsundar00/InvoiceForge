'use client'

import { Wifi, WifiOff, Sparkles, Calendar } from 'lucide-react'

export default function Statusbar() {
  return (
    <footer className="statusbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wifi size={12} style={{ color: 'var(--color-success)' }} />
          Connected
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={12} style={{ color: 'var(--color-primary)' }} />
          AI: Ready
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={12} />
          FY: 2025-26
        </span>
        <span>InvoiceForge v1.1.0</span>
      </div>
    </footer>
  )
}
