import { IQuestion } from '@/types/assignment'

interface QuestionItemProps {
  question: IQuestion
  index: number
  globalIndex: number
}

const OPTION_LABELS = ['a', 'b', 'c', 'd']

export default function QuestionItem({ question, globalIndex }: QuestionItemProps) {
  const marksLabel = `[${question.marks} ${question.marks === 1 ? 'Mark' : 'Marks'}]`

  return (
    <div className="question-item" style={{ fontSize: 15, color: '#111827', lineHeight: 1.6, marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontWeight: 700, minWidth: 24 }}>{globalIndex + 1}.</span>
      <div style={{ flex: 1 }}>
        <span>
          <span className="difficulty-tag" style={{ fontWeight: 600, color: '#6b7280', marginRight: 4 }}>
            [{question.difficulty}]
          </span>
          {question.text}{' '}
          <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{marksLabel}</span>
        </span>

        {/* MCQ options */}
        {question.type === 'mcq' && question.options && question.options.length > 0 && (
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 32px' }}>
            {question.options.map((opt, i) => (
              <div key={i} style={{ fontSize: 14, color: '#374151' }}>
                <span style={{ fontWeight: 600 }}>{OPTION_LABELS[i].toUpperCase()}.</span> {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
