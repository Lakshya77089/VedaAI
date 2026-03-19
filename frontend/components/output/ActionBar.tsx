'use client'

import { FileText, RefreshCw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface ActionBarProps {
  assignmentId: string
  assignmentName: string
  onRegenerate: () => void
  isRegenerating: boolean
  onPrintQuestions: () => void
  isPrinting: boolean
}

export default function ActionBar({ assignmentId, onRegenerate, isRegenerating, onPrintQuestions, isPrinting }: ActionBarProps) {
  const router = useRouter()

  return (
    <div
      className="no-print"
      style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'white',
        borderTop: '1px solid var(--color-border)',
        padding: '14px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <Button
        variant="ghost"
        icon={<ArrowLeft size={15} />}
        onClick={() => router.push('/assignments')}
      >
        Back
      </Button>

      <div style={{ display: 'flex', gap: 10 }}>
        <Button
          variant="secondary"
          loading={isRegenerating}
          icon={<RefreshCw size={14} />}
          onClick={onRegenerate}
        >
          Regenerate
        </Button>
        <Button
          variant="secondary"
          loading={isPrinting}
          icon={<FileText size={14} />}
          onClick={onPrintQuestions}
        >
          Print Questions Only
        </Button>
      </div>
    </div>
  )
}
