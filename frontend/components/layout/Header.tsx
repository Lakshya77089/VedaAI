'use client'

import { Bell, ChevronDown, LayoutGrid } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAssignmentStore } from '@/store/useAssignmentStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useEffect, useState } from 'react'
import NotificationDropdown from './NotificationDropdown'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { unreadCount, fetchNotifications } = useNotificationStore()

  useEffect(() => {
    setMounted(true)
    fetchNotifications()
  }, [fetchNotifications])

  const pathname = usePathname()
  const router = useRouter()
  const currentAssignment = useAssignmentStore((s) => s.currentAssignment)

  const getPageLabel = () => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return 'Home'
    
    // Check if on assignment detail page: /assignments/[id]
    if (segments[0] === 'assignments' && segments.length === 2 && segments[1] !== 'create') {
      if (currentAssignment && currentAssignment._id === segments[1]) {
        return currentAssignment.name || 'Assignment'
      }
      return 'Assignment'
    }

    const last = segments[segments.length - 1]
    if (last === 'create') return 'Create Assignment'
    if (last === 'assignments') return 'Assignments'
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ')
  }

  const pageLabel = getPageLabel()
  const canGoBack = pathname !== '/' && pathname !== '/assignments'

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: '240px',
        height: '60px',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backgroundColor: 'white',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left — back + page label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {canGoBack && (
          <button
            onClick={() => router.back()}
            suppressHydrationWarning
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LayoutGrid size={16} style={{ color: '#9ca3af' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
            {mounted ? pageLabel : 'Assignments'}
          </span>
        </div>
      </div>

      {/* Right — bell + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            suppressHydrationWarning
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              backgroundColor: notifOpen ? '#f3f4f6' : 'transparent',
              transition: 'background 0.2s',
            }}
          >
            <Bell size={18} style={{ color: notifOpen ? '#111827' : '#6b7280' }} />
            {mounted && unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationDropdown onClose={() => setNotifOpen(false)} />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#374151',
              flexShrink: 0,
            }}
          >
            JD
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>John Doe</span>
          <ChevronDown size={14} style={{ color: '#9ca3af' }} />
        </div>
      </div>
    </header>
  )
}
