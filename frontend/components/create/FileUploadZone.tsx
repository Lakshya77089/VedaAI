'use client'

import { useState, useRef, DragEvent } from 'react'
import { Upload, FileText, X, Image } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface FileUploadZoneProps {
  file: File | null
  onChange: (file: File | null) => void
  error?: string
}

export default function FileUploadZone({ file, onChange, error }: FileUploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndSet(dropped)
  }

  const validateAndSet = (f: File) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!allowed.includes(f.type)) {
      showToast('Only PDF and image files (PNG, JPG) are allowed.', 'error')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      showToast('File must be under 10MB.', 'error')
      return
    }
    onChange(f)
  }

  const isPDF = file?.type === 'application/pdf'
  const previewURL = file && !isPDF ? URL.createObjectURL(file) : null

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        style={{
          border: `2px dashed ${error ? '#fca5a5' : dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 14,
          padding: '32px 20px',
          textAlign: 'center',
          cursor: file ? 'default' : 'pointer',
          backgroundColor: dragging ? '#fff7ed' : file ? '#f9fafb' : 'white',
          transition: 'all 0.2s',
          position: 'relative',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files?.[0]) validateAndSet(e.target.files[0]) }}
        />

        {file ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {previewURL ? (
              // Image preview
              <img
                src={previewURL}
                alt="preview"
                style={{ maxHeight: 80, maxWidth: 100, borderRadius: 8, objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isPDF ? (
                  <FileText size={22} style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <Image size={22} style={{ color: 'var(--color-primary)' }} />
                )}
              </div>
            )}
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{file.name}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                padding: 4,
                borderRadius: 6,
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Upload size={22} style={{ color: 'var(--color-primary)' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)', marginBottom: 4 }}>
              Choose a file or drag & drop it here
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              Upload images of your preferred document/image
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
                padding: '8px 20px',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                backgroundColor: 'white',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                color: 'var(--foreground)',
              }}
            >
              Browse File
            </button>
          </>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{error}</p>}
    </div>
  )
}
