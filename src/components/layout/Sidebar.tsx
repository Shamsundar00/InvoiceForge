'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileSpreadsheet,
  CheckSquare,
  Palette,
  Zap,
  Image,
  BarChart3,
  Clock,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Data Source', href: '/data-source', icon: FileSpreadsheet },
      { label: 'Validate Excel', href: '/validate', icon: CheckSquare },
    ],
  },
  {
    section: 'Create',
    items: [
      { label: 'Templates', href: '/templates', icon: Palette },
      { label: 'Generate', href: '/generate', icon: Zap },
      { label: 'Invoice Gallery', href: '/gallery', icon: Image },
    ],
  },
  {
    section: 'Insights',
    items: [
      { label: 'Audit & Reports', href: '/audit', icon: BarChart3 },
      { label: 'History', href: '/history', icon: Clock },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Backup', href: '/backup', icon: Database },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">IF</div>
        <span className="sidebar-brand">InvoiceForge</span>
      </div>

      {/* Collapse Toggle */}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-item-icon">
                    <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  <span className="nav-item-label">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          className="nav-item"
          style={{ fontSize: '12px', color: 'var(--text-tertiary)', cursor: 'default' }}
        >
          <span className="nav-item-icon">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--color-success)',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
              }}
            />
          </span>
          <span className="nav-item-label" style={{ fontSize: '11px' }}>
            v1.1.0 • Local Mode
          </span>
        </div>
      </div>
    </aside>
  )
}
