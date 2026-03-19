import { X } from 'lucide-react'
import { QuestionConfigItem } from '@/types/assignment'

interface QuestionTypeRowProps {
  item: QuestionConfigItem
  onChange: (updated: QuestionConfigItem) => void
  onRemove: () => void
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid var(--color-border)',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#374151',
          lineHeight: 1,
        }}
      >
        −
      </button>
      <span
        style={{
          minWidth: 32,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 600,
          color: '#111827',
        }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid var(--color-border)',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#374151',
          lineHeight: 1,
        }}
      >
        +
      </button>
    </div>
  )
}

export default function QuestionTypeRow({ item, onChange, onRemove }: QuestionTypeRowProps) {
  const handleLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...item, label: e.target.value, type: e.target.value.toLowerCase().replace(/\s+/g, '_') })
  }

  return (
    <>
      {/* Desktop row */}
      <div
        className="desktop-only"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '10px 0',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Dropdown-style label */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: 'white',
          }}
        >
          <input
            type="text"
            value={item.label}
            onChange={handleLabel}
            placeholder="e.g. Multiple Choice"
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: 'var(--foreground)',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        <button
          type="button"
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af',
            display: 'flex',
            padding: 4,
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>

        <Stepper value={item.count} onChange={(v) => onChange({ ...item, count: v })} />
        <Stepper value={item.marksEach} onChange={(v) => onChange({ ...item, marksEach: v })} />
      </div>

      {/* Mobile card */}
      <div
        className="mobile-only"
        style={{
          flexDirection: 'column',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          backgroundColor: 'white',
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 14px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <input
            type="text"
            value={item.label}
            onChange={handleLabel}
            placeholder="e.g. Multiple Choice"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: 'var(--foreground)',
              backgroundColor: 'transparent',
            }}
          />
          <button
            type="button"
            onClick={onRemove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 2 }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', padding: '12px 14px', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>No. of Questions</p>
            <Stepper value={item.count} onChange={(v) => onChange({ ...item, count: v })} />
          </div>
          <div style={{ width: 1, backgroundColor: 'var(--color-border)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>Marks</p>
            <Stepper value={item.marksEach} onChange={(v) => onChange({ ...item, marksEach: v })} />
          </div>
        </div>
      </div>
    </>
  )
}
