'use client'

import { Bell, Menu } from 'lucide-react'

interface MobileHeaderProps {
  onMenuOpen?: () => void
  title?: string
}

export default function MobileHeader({ onMenuOpen, title }: MobileHeaderProps) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        padding: '10px 16px',
        backgroundColor: 'var(--background)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          borderRadius: 16,
          padding: '10px 16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          position: 'relative',
        }}
      >
        {/* Left — logo or spacer */}
        {title ? (
          <div style={{ width: 40 }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>V</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>VedaAI</span>
          </div>
        )}

        {/* Centered title */}
        {title && (
          <span
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 700,
              fontSize: 16,
              color: '#111827',
              pointerEvents: 'none',
            }}
          >
            {title}
          </span>
        )}

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Bell */}
          <button
            suppressHydrationWarning
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
            }}
          >
            <Bell size={20} style={{ color: '#374151' }} />
            <span
              style={{
                position: 'absolute',
                top: 3,
                right: 3,
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                border: '1.5px solid white',
              }}
            />
          </button>

          {/* Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid #e5e7eb',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#9ca3af" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#9ca3af" />
            </svg>
          </div>

          {/* Hamburger */}
          <button
            onClick={onMenuOpen}
            suppressHydrationWarning
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <Menu size={22} style={{ color: '#374151' }} />
          </button>
        </div>
      </div>
    </header>
  )
}
