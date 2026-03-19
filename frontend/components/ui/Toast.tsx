'use client'

import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

const config = {
  success: { icon: CheckCircle, bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', iconColor: '#16a34a' },
  error:   { icon: AlertCircle, bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', iconColor: '#dc2626' },
  warning: { icon: AlertTriangle, bg: '#fffbeb', border: '#fde68a', text: '#92400e', iconColor: '#d97706' },
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const { icon: Icon, bg, border, text, iconColor } = config[type]

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: bg, border: `1px solid ${border}`, borderRadius: 10,
      padding: '12px 14px', minWidth: 280, maxWidth: 380, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <Icon size={18} color={iconColor} style={{ flexShrink: 0, marginTop: 1 }} />
      <p style={{ flex: 1, fontSize: 14, color: text, margin: 0, lineHeight: 1.5 }}>{message}</p>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: text, flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>
  )
}
