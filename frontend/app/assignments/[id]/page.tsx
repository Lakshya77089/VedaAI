'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, Download, RefreshCw } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import QuestionPaper from '@/components/output/QuestionPaper'
import ActionBar from '@/components/output/ActionBar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAssignmentStore } from '@/store/useAssignmentStore'
import { useSocket } from '@/hooks/useSocket'
import { AssignmentDetail } from '@/types/assignment'
import api from '@/lib/api'
import { downloadAsPDF } from '@/lib/pdf'
import { useToast } from '@/context/ToastContext'

export default function AssignmentOutputPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { currentAssignment, setCurrentAssignment, generationStatus, updateGenerationStatus } = useAssignmentStore()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [printing, setPrinting] = useState(false)

  useSocket(id)

  const liveStatus = generationStatus[id] ?? currentAssignment?.status ?? 'pending'

  useEffect(() => {
    if (!id) return
    fetchAssignment()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchAssignment() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/assignments/${id}`)
      const assignment: AssignmentDetail = data.data
      setCurrentAssignment(assignment)
      updateGenerationStatus(id, assignment.status)
    } catch {
      setError('Failed to load assignment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (liveStatus === 'complete' && !currentAssignment?.generatedContent) {
      fetchAssignment()
    }
  }, [liveStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRegenerate() {
    if (regenerating) return
    setRegenerating(true)
    try {
      await api.post(`/assignments/${id}/regenerate`)
      updateGenerationStatus(id, 'pending')
      setCurrentAssignment(currentAssignment ? { ...currentAssignment, status: 'pending', generatedContent: undefined } : null)
    } catch {
      setError('Failed to start regeneration.')
    } finally {
      setRegenerating(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    const result = await downloadAsPDF('question-paper-root', `${currentAssignment?.name?.replace(/\s+/g, '_') ?? 'paper'}.pdf`)
    setDownloading(false)
    if (!result.success) showToast(result.error ?? 'Could not generate PDF.', 'error')
  }

  const handlePrintQuestions = async () => {
    setPrinting(true)
    const result = await downloadAsPDF(
      'question-paper-root',
      `${currentAssignment?.name?.replace(/\s+/g, '_') ?? 'paper'}_questions.pdf`,
      { hideSelector: '.answer-key-section, .difficulty-tag' }
    )
    setPrinting(false)
    if (!result.success) showToast(result.error ?? 'Could not generate PDF.', 'error')
  }

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <LoadingSpinner size={48} />
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, textAlign: 'center' }}>
          <AlertCircle size={48} color="#ef4444" />
          <p style={{ fontSize: 16, color: '#ef4444' }}>{error}</p>
          <button
            onClick={fetchAssignment}
            style={{ padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}
          >
            Try Again
          </button>
        </div>
      </AppShell>
    )
  }

  if (liveStatus === 'pending' || liveStatus === 'processing') {
    const statusText = liveStatus === 'processing'
      ? 'AI is generating your question paper...'
      : 'Queued — waiting for AI worker...'
    return (
      <AppShell>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 20, textAlign: 'center' }}>
          <LoadingSpinner size={56} />
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)', marginBottom: 8 }}>
              {liveStatus === 'processing' ? 'Generating Assessment...' : 'Queued for Generation'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 360, lineHeight: 1.6 }}>
              {statusText}
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
              This usually takes 2-3 minutes. You will be notified automatically.
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (liveStatus === 'error') {
    return (
      <AppShell>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>Generation Failed</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 360 }}>
            {currentAssignment?.errorMessage || 'The AI failed to generate the assessment. Please try again.'}
          </p>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
              backgroundColor: 'var(--color-primary)', color: 'white', border: 'none',
              borderRadius: 12, cursor: regenerating ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 600, opacity: regenerating ? 0.7 : 1,
            }}
          >
            <RefreshCw size={15} />
            {regenerating ? 'Queuing...' : 'Try Again'}
          </button>
        </div>
      </AppShell>
    )
  }

  if (!currentAssignment?.generatedContent) {
    return (
      <AppShell>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <LoadingSpinner size={40} />
        </div>
      </AppShell>
    )
  }

  const { totalQuestions, totalMarks, timeAllowed } = currentAssignment.generatedContent

  return (
    <AppShell>
      <div style={{ padding: '24px 24px 0' }}>
        {/* Dark AI response banner */}
        <div
          style={{
            backgroundColor: '#1a1a2e',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>
                AI Teacher&apos;s Toolkit
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#e5e7eb', lineHeight: 1.6, margin: 0 }}>
              Here is your customized question paper for{' '}
              <strong style={{ color: 'white' }}>{currentAssignment.className}</strong>{' '}
              <strong style={{ color: 'white' }}>{currentAssignment.subject}</strong>.
              {' '}The paper contains{' '}
              <strong style={{ color: 'white' }}>{totalQuestions} questions</strong>{' '}
              worth <strong style={{ color: 'white' }}>{totalMarks} marks</strong>{' '}
              with a time limit of <strong style={{ color: 'white' }}>{timeAllowed} minutes</strong>.
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              backgroundColor: 'white',
              color: '#111827',
              border: 'none',
              borderRadius: 50,
              fontSize: 13,
              fontWeight: 600,
              cursor: downloading ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              opacity: downloading ? 0.7 : 1,
            }}
          >
            <Download size={14} />
            {downloading ? 'Preparing...' : 'Download as PDF'}
          </button>
        </div>

        {/* Question paper */}
        <QuestionPaper assignment={currentAssignment} />
      </div>

      <ActionBar
        assignmentId={id}
        assignmentName={currentAssignment.name}
        onRegenerate={handleRegenerate}
        isRegenerating={regenerating}
        onPrintQuestions={handlePrintQuestions}
        isPrinting={printing}
      />
    </AppShell>
  )
}
