import { ISection } from '@/types/assignment'
import QuestionItem from './QuestionItem'

interface SectionBlockProps {
  section: ISection
  startIndex: number
  isLast?: boolean
}

export default function SectionBlock({ section, startIndex, isLast }: SectionBlockProps) {
  return (
    <div className="section-block" style={{ marginBottom: 40 }}>
      {/* Section title centered */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {section.title}
        </p>
      </div>

      {/* Question type heading */}
      <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
        {section.questions[0]?.type
          ? section.questions[0].type
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase()) + ' Questions'
          : 'Questions'}
      </p>

      {/* Instruction */}
      <p style={{ fontSize: 13, fontStyle: 'italic', color: '#374151', marginBottom: 20 }}>
        {section.instruction}
      </p>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {section.questions.map((q, i) => (
          <QuestionItem
            key={q.id}
            question={q}
            index={i}
            globalIndex={startIndex + i}
          />
        ))}
      </div>

      {isLast && (
        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, marginTop: 20, color: '#111827' }}>
          End of Question Paper
        </p>
      )}
    </div>
  )
}
