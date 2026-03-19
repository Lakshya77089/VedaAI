import { ISection } from '@/types/assignment'

interface AnswerKeySectionProps {
  sections: ISection[]
}

export default function AnswerKeySection({ sections }: AnswerKeySectionProps) {
  const allQuestions = sections.flatMap((s) => s.questions)

  return (
    <div className="answer-key-section" style={{ marginTop: 40, paddingTop: 32, borderTop: '2px dashed #e5e7eb' }}>
      <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
        Answer Key:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {allQuestions.map((q, i) => (
          <div
            key={q.id}
            style={{
              fontSize: 15,
              color: '#374151',
              lineHeight: 1.6,
              display: 'flex',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 700, minWidth: 24 }}>{i + 1}.</span>
            <span>{q.answerKey}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
