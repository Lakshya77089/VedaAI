'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'

interface ThreeDotMenuProps {
  onView: () => void
  onDelete: () => void
  onDuplicate?: () => void
}

export default function ThreeDotMenu({ onView, onDelete, onDuplicate }: ThreeDotMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '6px',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 4,
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            zIndex: 50,
            minWidth: 160,
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => { setOpen(false); onView() }}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--foreground)',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            View Assignment
          </button>
          {onDuplicate && (
            <button
              onClick={() => { setOpen(false); onDuplicate() }}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'none',
                border: 'none',
                borderTop: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--foreground)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Duplicate
            </button>
          )}
          <button
            onClick={() => { setOpen(false); onDelete() }}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'none',
              border: 'none',
              borderTop: '1px solid var(--color-border)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: '#ef4444',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
