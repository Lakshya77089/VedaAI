import Link from 'next/link'

export default function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        textAlign: 'center',
      }}
    >
      {/* Illustration — magnifying glass with red X */}
      <div style={{ marginBottom: 28, position: 'relative', width: 160, height: 160 }}>
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background circle */}
          <circle cx="80" cy="80" r="72" fill="#f3f4f6" />

          {/* Document behind */}
          <rect x="52" y="34" width="52" height="66" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
          <rect x="62" y="48" width="32" height="4" rx="2" fill="#e5e7eb" />
          <rect x="62" y="58" width="24" height="4" rx="2" fill="#e5e7eb" />
          <rect x="62" y="68" width="28" height="4" rx="2" fill="#e5e7eb" />

          {/* Magnifying glass circle */}
          <circle cx="84" cy="82" r="28" fill="white" stroke="#d1d5db" strokeWidth="2" />
          <circle cx="84" cy="82" r="20" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" />

          {/* Red X inside magnifying glass */}
          <circle cx="84" cy="82" r="12" fill="#fee2e2" />
          <path d="M79 77l10 10M89 77l-10 10" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />

          {/* Magnifying glass handle */}
          <path d="M106 104l10 10" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />

          {/* Sparkle dots */}
          <circle cx="44" cy="110" r="3.5" fill="#93c5fd" />
          <circle cx="122" cy="52" r="2.5" fill="#fca5a5" />
          <circle cx="128" cy="112" r="2" fill="#6ee7b7" />
        </svg>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
        No assignments yet
      </h2>
      <p
        style={{
          fontSize: 14,
          color: '#6b7280',
          maxWidth: 360,
          lineHeight: 1.7,
          marginBottom: 28,
        }}
      >
        Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <Link
        href="/assignments/create"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 28px',
          backgroundColor: '#111827',
          color: 'white',
          borderRadius: 50,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
        Create Your First Assignment
      </Link>
    </div>
  )
}
