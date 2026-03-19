'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { Search, Bell, Moon, Sun, Command } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Topbar() {
  const { theme, toggleTheme } = useTheme()
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('global-search')?.focus()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        toggleTheme()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [toggleTheme])

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="search-bar">
          <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            id="global-search"
            type="text"
            placeholder="Search invoices, templates, settings..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {!searchFocused && (
            <kbd className="search-kbd">
              <Command size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> K
            </kbd>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {/* Notifications */}
        <button className="btn btn-ghost btn-icon" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <div className="toggle-knob" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'dark' ? <Moon size={12} color="#6366F1" /> : <Sun size={12} color="#F59E0B" />}
          </div>
        </button>

        {/* User Avatar */}
        <button
          className="btn btn-ghost btn-icon"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), #8B5CF6)',
            color: 'white',
            fontWeight: 700,
            fontSize: '13px',
            borderRadius: 'var(--radius-full)',
            width: 34,
            height: 34,
          }}
          title="Admin"
        >
          A
        </button>
      </div>
    </header>
  )
}
