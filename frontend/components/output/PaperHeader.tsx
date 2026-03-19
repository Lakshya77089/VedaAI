import { AssignmentDetail } from '@/types/assignment'

interface PaperHeaderProps {
  assignment: AssignmentDetail
  totalMarks: number
  timeAllowed: number
}

export default function PaperHeader({ assignment, totalMarks, timeAllowed }: PaperHeaderProps) {
  return (
    <div style={{ marginBottom: 28 }}>

      {/* School name */}
      <h1 style={{
        fontSize: 20,
        fontWeight: 800,
        color: '#111827',
        textAlign: 'center',
        margin: '0 0 6px',
        letterSpacing: '-0.01em',
      }}>
        Delhi Public School, Sector-4, Bokaro
      </h1>

      {/* Divider */}
      <div style={{ borderBottom: '2px solid #111827', margin: '8px 0' }} />

      {/* Subject + Class — centered, stacked */}
      <div style={{ textAlign: 'center', margin: '8px 0 10px' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 3px' }}>
          Subject: {assignment.subject}
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
          Class: {assignment.className}
        </p>
      </div>

      {/* Time + Marks */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 13,
        fontWeight: 500,
        color: '#374151',
        marginBottom: 14,
      }}>
        <span>Time Allowed: {timeAllowed} minutes</span>
        <span>Maximum Marks: {totalMarks}</span>
      </div>

      {/* Divider */}
      <div style={{ borderBottom: '1px solid #d1d5db', marginBottom: 14 }} />

      {/* Instructions */}
      <p style={{ fontSize: 13, color: '#374151', marginBottom: 16, lineHeight: 1.6 }}>
        <strong>General Instructions: </strong>
        All questions are compulsory unless stated otherwise.
        {assignment.additionalInstructions
          ? ' ' + assignment.additionalInstructions
          : ''}
      </p>

      {/* Student fill-in fields — stacked like screenshot */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>

        {/* Name */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', color: '#111827' }}>Name:</span>
          <span style={{ flex: 1, maxWidth: 280, borderBottom: '1.5px solid #374151', display: 'inline-block', minHeight: 20 }} />
        </div>

        {/* Roll Number */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', color: '#111827' }}>Roll Number:</span>
          <span style={{ width: 120, borderBottom: '1.5px solid #374151', display: 'inline-block', minHeight: 20 }} />
        </div>

        {/* Class (pre-filled) + Section (blank) inline */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', color: '#111827' }}>
            Class: {assignment.className}&nbsp;&nbsp;Section:
          </span>
          <span style={{ width: 80, borderBottom: '1.5px solid #374151', display: 'inline-block', minHeight: 20 }} />
        </div>

      </div>

      {/* Thick divider before questions */}
      <div style={{ borderBottom: '2px solid #111827' }} />

    </div>
  )
}
