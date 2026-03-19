import { useEffect, useRef } from 'react'
import { AssignmentListItem } from '@/types/assignment'
import AssignmentCard from './AssignmentCard'
import EmptyState from './EmptyState'

interface AssignmentGridProps {
  assignments: AssignmentListItem[]
  onDelete: (id: string) => void
  hasMore: boolean
  isFetchingMore: boolean
  onLoadMore: () => void
}

export default function AssignmentGrid({
  assignments,
  onDelete,
  hasMore,
  isFetchingMore,
  onLoadMore,
}: AssignmentGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isFetchingMore, onLoadMore])

  if (assignments.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <div className="assignment-grid">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment._id}
            assignment={assignment}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Loading indicator */}
      {isFetchingMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#9ca3af',
                animation: 'pulse 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}
