'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { AssignmentListItem } from '@/types/assignment'
import ThreeDotMenu from '@/components/ui/ThreeDotMenu'

interface AssignmentCardProps {
  assignment: AssignmentListItem
  onDelete: (id: string) => void
}

export default function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const router = useRouter()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const handleView = () => router.push(`/assignments/${assignment._id}`)
  const handleDeleteClick = () => setConfirmingDelete(true)
  const handleConfirmDelete = () => { setConfirmingDelete(false); onDelete(assignment._id) }
  const handleCancelDelete = () => setConfirmingDelete(false)

  const assignedDate = format(new Date(assignment.createdAt), 'dd-MM-yyyy')
  const dueDate = format(new Date(assignment.dueDate), 'dd-MM-yyyy')

  return (
    <div
      onClick={!confirmingDelete ? handleView : undefined}
      style={{
        backgroundColor: 'white',
        border: `1px solid ${confirmingDelete ? '#fca5a5' : 'var(--color-border)'}`,
        borderRadius: 16,
        padding: '18px 20px',
        cursor: confirmingDelete ? 'default' : 'pointer',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
      onMouseEnter={(e) => { if (!confirmingDelete) { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#d1d5db' } }}
      onMouseLeave={(e) => { if (!confirmingDelete) { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--color-border)' } }}
    >
      {/* Top row: title + menu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.4, flex: 1 }}>
          {assignment.name}
        </h3>
        <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
          <ThreeDotMenu onView={handleView} onDelete={handleDeleteClick} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: '#f3f4f6' }} />

      {/* Inline delete confirmation */}
      {confirmingDelete ? (
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <p style={{ fontSize: 12, color: '#b91c1c', fontWeight: 500 }}>Delete this assignment?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleCancelDelete}
              style={{ fontSize: 12, padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#374151' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              style={{ fontSize: 12, padding: '4px 12px', border: 'none', borderRadius: 8, background: '#ef4444', cursor: 'pointer', color: 'white', fontWeight: 600 }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        /* Bottom row: dates */
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 12, color: '#6b7280' }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>Assigned on : </span>
            {assignedDate}
          </p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>Due : </span>
            {dueDate}
          </p>
        </div>
      )}
    </div>
  )
}
