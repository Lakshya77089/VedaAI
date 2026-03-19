import { QuestionConfig, QuestionConfigItem } from '@/types/assignment'
import QuestionTypeRow from './QuestionTypeRow'
import { Plus } from 'lucide-react'

interface QuestionConfigSectionProps {
  config: QuestionConfig
  onChange: (config: QuestionConfig) => void
}

export default function QuestionConfigSection({ config, onChange }: QuestionConfigSectionProps) {
  const totalQuestions = config.reduce((sum, item) => sum + item.count, 0)
  const totalMarks = config.reduce((sum, item) => sum + item.count * item.marksEach, 0)

  const updateItem = (index: number, updated: QuestionConfigItem) => {
    const next = [...config]
    next[index] = updated
    onChange(next)
  }

  const removeItem = (index: number) => {
    onChange(config.filter((_, i) => i !== index))
  }

  const addItem = () => {
    onChange([...config, { type: '', label: '', count: 0, marksEach: 1 }])
  }

  return (
    <div>
      {/* Desktop column headers */}
      <div
        className="desktop-only"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          paddingBottom: 8,
          marginBottom: 2,
        }}
      >
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#111827' }}>
          Question Type
        </span>
        <span style={{ width: 28 }} />
        <span
          style={{
            width: 88,
            fontSize: 13,
            fontWeight: 600,
            color: '#111827',
            textAlign: 'center',
          }}
        >
          No. of Questions
        </span>
        <span
          style={{
            width: 88,
            fontSize: 13,
            fontWeight: 600,
            color: '#111827',
            textAlign: 'center',
          }}
        >
          Marks
        </span>
      </div>

      {config.map((item, i) => (
        <QuestionTypeRow
          key={i}
          item={item}
          onChange={(updated) => updateItem(i, updated)}
          onRemove={() => removeItem(i)}
        />
      ))}

      {/* Add Question Type */}
      <button
        type="button"
        onClick={addItem}
        style={{
          marginTop: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14,
          fontWeight: 500,
          color: '#374151',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Plus size={14} color="white" />
        </span>
        Add Question Type
      </button>

      {/* Totals */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 4,
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontSize: 13, color: '#374151' }}>
          Total Questions : <strong>{totalQuestions}</strong>
        </span>
        <span style={{ fontSize: 13, color: '#374151' }}>
          Total Marks : <strong>{totalMarks}</strong>
        </span>
      </div>
    </div>
  )
}
