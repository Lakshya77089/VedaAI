'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, X } from 'lucide-react'
import { useAssignmentStore } from '@/store/useAssignmentStore'

export default function GenerationCompleteToast() {
  const router = useRouter()
  const { readyNotification, setReadyNotification } = useAssignmentStore()

  useEffect(() => {
    if (!readyNotification) return
    const timer = setTimeout(() => setReadyNotification(null), 8000)
    return () => clearTimeout(timer)
  }, [readyNotification, setReadyNotification])

  if (!readyNotification) return null

  const { id, name } = readyNotification

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        backgroundColor: 'white',
        border: '1px solid #bbf7d0',
        borderRadius: 16,
        padding: '16px 20px',
        minWidth: 300,
        maxWidth: 360,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        animation: 'slideInRight 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <CheckCircle size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)', marginBottom: 2 }}>
            Exam Generated!
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12, lineHeight: 1.4 }}>
            {name}
          </p>
          <button
            onClick={() => {
              setReadyNotification(null)
              router.push(`/assignments/${id}`)
            }}
            style={{
              padding: '7px 16px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            View Exam
          </button>
        </div>
        <button
          onClick={() => setReadyNotification(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9ca3af', flexShrink: 0 }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
