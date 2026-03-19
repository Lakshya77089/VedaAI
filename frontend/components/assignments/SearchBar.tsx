'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 14px',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          backgroundColor: 'white',
          flex: 1,
        }}
      >
        <Search size={15} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search Assignment"
          style={{
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: 'var(--foreground)',
            backgroundColor: 'transparent',
            width: '100%',
          }}
        />
      </div>
    </div>
  )
}
