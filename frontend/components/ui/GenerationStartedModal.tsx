'use client'

import { useRouter } from 'next/navigation'
import LoadingSpinner from './LoadingSpinner'
import { useAssignmentStore } from '@/store/useAssignmentStore'

interface GenerationStartedModalProps {
  assignmentId: string
  assignmentName: string
  onClose: () => void
}

export default function GenerationStartedModal({ assignmentId, assignmentName, onClose }: GenerationStartedModalProps) {
  const router = useRouter()
  const { setGeneratingAssignment } = useAssignmentStore()

  const runInBackground = () => {
    setGeneratingAssignment({ id: assignmentId, name: assignmentName })
    onClose()
    router.push('/assignments')
  }

  const watchProgress = () => {
    onClose()
    router.push(`/assignments/${assignmentId}`)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: '36px 40px',
          maxWidth: 420,
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <LoadingSpinner size={48} />
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 14,
            padding: '4px 12px',
            borderRadius: 20,
            backgroundColor: '#fff7ed',
            color: 'var(--color-primary)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ⚡ VedaAI is working
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 8 }}>
          Generating Assessment
        </h3>

        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 4, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--foreground)' }}>{assignmentName}</strong>
        </p>

        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28, lineHeight: 1.6 }}>
          This runs in the background. You can leave this page — we&apos;ll notify you when it&apos;s done.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={runInBackground}
            style={{
              flex: 1,
              padding: '11px 0',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Run in Background
          </button>
          <button
            onClick={watchProgress}
            style={{
              flex: 1,
              padding: '11px 0',
              backgroundColor: 'white',
              color: 'var(--foreground)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Watch Progress
          </button>
        </div>
      </div>
    </div>
  )
}
