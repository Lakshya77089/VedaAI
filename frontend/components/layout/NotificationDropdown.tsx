'use client'

import { useNotificationStore } from '@/store/useNotificationStore'
import { useRouter } from 'next/navigation'
import { Check, Clock, ExternalLink, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NotificationDropdownProps {
  onClose: () => void
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter()
  const { notifications, markAsRead, markAllAsRead, isLoading } = useNotificationStore()

  const handleNotificationClick = async (n: any) => {
    if (!n.read) await markAsRead(n._id)
    if (n.assignmentId) {
      router.push(`/assignments/${n.assignmentId}`)
      onClose()
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 8,
        width: 340,
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        border: '1px solid var(--color-border)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 500,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Notifications</span>
        {notifications.some(n => !n.read) && (
          <button
            onClick={() => markAllAsRead()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-primary)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ color: '#9ca3af', marginBottom: 8 }}>
              <Clock size={32} style={{ margin: '0 auto', opacity: 0.5 }} />
            </div>
            <p style={{ color: '#6b7280', fontSize: 13 }}>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid #f9fafb',
                cursor: 'pointer',
                backgroundColor: n.read ? 'white' : '#f0f9ff',
                transition: 'background 0.2s',
                display: 'flex',
                gap: 12,
                position: 'relative',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = n.read ? '#f9fafb' : '#e0f2fe')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = n.read ? 'white' : '#f0f9ff')}
            >
              {!n.read && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: 20, 
                    left: 6, 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    backgroundColor: '#3b82f6' 
                  }} 
                />
              )}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: n.type === 'success' ? '#dcfce7' : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={18} color={n.type === 'success' ? '#16a34a' : '#6b7280'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#111827', margin: 0 }}>{n.title}</p>
                </div>
                <p style={{ fontSize: 13, color: '#4b5563', margin: '0 0 6px', lineHeight: 1.4 }}>
                  {n.message}
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {n.assignmentId && (
                <ExternalLink size={14} style={{ color: '#9ca3af', marginTop: 4 }} />
              )}
            </div>
          ))
        )}
      </div>

      <div
        style={{
          padding: '12px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
