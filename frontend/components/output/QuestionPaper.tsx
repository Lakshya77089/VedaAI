import { AssignmentDetail } from '@/types/assignment'
import PaperHeader from './PaperHeader'
import SectionBlock from './SectionBlock'
import AnswerKeySection from './AnswerKeySection'

interface QuestionPaperProps {
  assignment: AssignmentDetail
  hideAnswers?: boolean
}

export default function QuestionPaper({ assignment, hideAnswers }: QuestionPaperProps) {
  const { generatedContent } = assignment
  if (!generatedContent) return null

  const { sections, totalMarks, timeAllowed } = generatedContent

  let qIndex = 0
  const sectionStartIndices: number[] = []
  for (const section of sections) {
    sectionStartIndices.push(qIndex)
    qIndex += section.questions.length
  }

  return (
    <div
      id="question-paper-root"
      style={{
        backgroundColor: 'white',
        padding: '60px 64px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        maxWidth: 820,
        margin: '0 auto',
        boxShadow: '0 4px 30px rgba(0,0,0,0.06)',
        borderRadius: 8,
        color: '#111827',
      }}
    >
      <PaperHeader
        assignment={assignment}
        totalMarks={totalMarks}
        timeAllowed={timeAllowed}
      />

      {sections.map((section, i) => (
        <SectionBlock
          key={section.id}
          section={section}
          startIndex={sectionStartIndices[i]}
          isLast={i === sections.length - 1}
        />
      ))}

      {!hideAnswers && <AnswerKeySection sections={sections} />}
    </div>
  )
}
