'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Mic, UploadCloud } from 'lucide-react'
import QuestionConfigSection from './QuestionConfigSection'
import GenerationStartedModal from '@/components/ui/GenerationStartedModal'
import { useAssignmentStore } from '@/store/useAssignmentStore'
import { QuestionConfig } from '@/types/assignment'
import api from '@/lib/api'

const DEFAULT_CONFIG: QuestionConfig = [
  { type: 'mcq', label: 'Multiple Choice Questions', count: 4, marksEach: 1 },
  { type: 'short_answer', label: 'Short Questions', count: 3, marksEach: 2 },
  { type: 'diagram', label: 'Diagram/Graph-Based Questions', count: 5, marksEach: 5 },
  { type: 'numerical', label: 'Numerical Problems', count: 5, marksEach: 5 },
]

interface FormErrors {
  name?: string
  subject?: string
  className?: string
  dueDate?: string
  questionConfig?: string
}

export default function CreateAssignmentForm() {
  const router = useRouter()
  const { updateGenerationStatus } = useAssignmentStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [className, setClassName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [questionConfig, setQuestionConfig] = useState<QuestionConfig>(DEFAULT_CONFIG)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [startedModal, setStartedModal] = useState<{ id: string; name: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  function validate(): boolean {
    const e: FormErrors = {}
    if (!name.trim()) e.name = 'Assignment name is required'
    if (!subject.trim()) e.subject = 'Subject is required'
    if (!className.trim()) e.className = 'Class / Grade is required'
    if (!dueDate) e.dueDate = 'Due date is required'
    else if (new Date(dueDate) <= new Date()) e.dueDate = 'Due date must be in the future'

    const totalQuestions = questionConfig.reduce((s, q) => s + q.count, 0)
    if (totalQuestions === 0) e.questionConfig = 'Add at least one question type with a count greater than 0'

    const hasEmpty = questionConfig.some((q) => !q.label.trim())
    if (hasEmpty) e.questionConfig = 'All question types must have a label'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const { data } = await api.post('/assignments', {
        name: name.trim(),
        subject: subject.trim(),
        className: className.trim(),
        dueDate: new Date(dueDate).toISOString(),
        additionalInstructions: additionalInstructions.trim(),
        questionConfig,
      })

      const assignmentId = data.data._id
      updateGenerationStatus(assignmentId, 'pending')
      setStartedModal({ id: assignmentId, name: name.trim() })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create assignment'
      setErrors({ name: msg })
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    color: 'var(--foreground)',
    backgroundColor: 'white',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--foreground)',
    marginBottom: 6,
    display: 'block',
  }

  return (
    <>
      {startedModal && (
        <GenerationStartedModal
          assignmentId={startedModal.id}
          assignmentName={startedModal.name}
          onClose={() => setStartedModal(null)}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', marginBottom: 2 }}>
              Assignment Details
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Basic information about your assignment
            </p>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Subject + Class row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  style={{ ...inputStyle, borderColor: errors.subject ? '#ef4444' : 'var(--color-border)' }}
                />
                {errors.subject && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.subject}</p>}
              </div>
              <div>
                <label style={labelStyle}>Class / Grade</label>
                <input
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Class 10"
                  style={{ ...inputStyle, borderColor: errors.className ? '#ef4444' : 'var(--color-border)' }}
                />
                {errors.className && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.className}</p>}
              </div>
            </div>

            {/* Assignment name */}
            <div>
              <label style={labelStyle}>Assignment Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chapter 5 Mid-Term Test"
                style={{ ...inputStyle, borderColor: errors.name ? '#ef4444' : 'var(--color-border)' }}
              />
              {errors.name && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.name}</p>}
            </div>

            {/* File upload */}
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  const f = e.dataTransfer.files[0]
                  if (f) setUploadedFile(f)
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--color-primary)' : '#d1d5db'}`,
                  borderRadius: 12,
                  padding: '28px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: dragOver ? '#fff7ed' : '#fafafa',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <UploadCloud
                  size={28}
                  style={{ color: '#9ca3af', margin: '0 auto 10px', display: 'block' }}
                />
                {uploadedFile ? (
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{uploadedFile.name}</p>
                ) : (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                      Choose a file or drag &amp; drop it here
                    </p>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>
                      JPEG, PNG, upto 10MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                      style={{
                        padding: '7px 20px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        backgroundColor: 'white',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        color: '#374151',
                      }}
                    >
                      Browse Files
                    </button>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setUploadedFile(f)
                  }}
                />
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
                Upload images of your preferred document/image
              </p>
            </div>

            {/* Due Date */}
            <div>
              <label style={labelStyle}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ ...inputStyle, borderColor: errors.dueDate ? '#ef4444' : 'var(--color-border)' }}
              />
              {errors.dueDate && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.dueDate}</p>}
            </div>

            {/* Question Type */}
            <div>
              <label style={{ ...labelStyle, marginBottom: 12 }}>Question Type</label>
              <QuestionConfigSection config={questionConfig} onChange={setQuestionConfig} />
              {errors.questionConfig && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{errors.questionConfig}</p>
              )}
            </div>

            {/* Additional Instructions */}
            <div>
              <label style={labelStyle}>Additional Information (For better output)</label>
              <div style={{ position: 'relative' }}>
                <textarea
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    paddingRight: 44,
                  }}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: 12,
                    bottom: 12,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    display: 'flex',
                    padding: 0,
                  }}
                >
                  <Mic size={18} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Previous / Next buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 24,
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/assignments')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 24px',
              border: '1px solid var(--color-border)',
              borderRadius: 50,
              backgroundColor: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              color: '#374151',
            }}
          >
            <ArrowLeft size={15} />
            Previous
          </button>

          <button
            type="submit"
            disabled={submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 28px',
              borderRadius: 50,
              border: 'none',
              backgroundColor: submitting ? '#6b7280' : '#111827',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Generating...' : 'Next'}
            {!submitting && <ArrowRight size={15} />}
          </button>
        </div>
      </form>
    </>
  )
}
