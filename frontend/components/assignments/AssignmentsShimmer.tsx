'use client'

export default function AssignmentsShimmer() {
  // Skeleton cards while searching/loading.
  return (
    <div className="assignment-grid" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          style={{
            borderRadius: 16,
            border: '1px solid var(--color-border)',
            background: 'white',
            padding: 18,
            overflow: 'hidden',
          }}
        >
          <div className="shimmer-card shimmer-title" style={{ height: 14, borderRadius: 8, width: '70%' }} />
          <div style={{ height: 12 }} />
          <div className="shimmer-card" style={{ height: 1, background: 'rgba(243,244,246,1)' }} />
          <div style={{ height: 12 }} />
          <div className="shimmer-card" style={{ height: 12, borderRadius: 8, width: '60%' }} />
          <div style={{ height: 10 }} />
          <div className="shimmer-card" style={{ height: 12, borderRadius: 8, width: '85%' }} />
          <div style={{ height: 10 }} />
          <div className="shimmer-card" style={{ height: 12, borderRadius: 8, width: '55%' }} />
        </div>
      ))}
    </div>
  )
}

