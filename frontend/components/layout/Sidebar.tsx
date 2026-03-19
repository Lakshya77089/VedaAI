'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Home,
  Users,
  BookOpen,
  Sparkles,
  Library,
  Settings,
  MapPin,
} from 'lucide-react'
import { useAssignmentStore } from '@/store/useAssignmentStore'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/groups', label: 'My Groups', icon: Users },
  { href: '/assignments', label: 'Assignments', icon: BookOpen },
  { href: '/toolkit', label: "AI Teacher's Toolkit", icon: Sparkles },
  { href: '/library', label: 'My Library', icon: Library },
]

export default function Sidebar() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const assignments = useAssignmentStore((s) => s.assignments)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-30"
      style={{ backgroundColor: 'white', borderRight: '1px solid var(--color-border)' }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>V</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>VedaAI</span>
        </div>
      </div>

      {/* Create Assignment button */}
      <div style={{ padding: '16px 16px 8px' }}>
        <Link
          href="/assignments/create"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '10px 16px',
            borderRadius: 50,
            backgroundColor: '#111827',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            border: '2px solid var(--color-primary)',
          }}
        >
          <Sparkles size={14} />
          Create Assignment
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 10,
                marginBottom: 2,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#111827' : '#6b7280',
                backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon size={17} style={{ color: isActive ? '#111827' : '#9ca3af' }} />
              <span>{label}</span>
              {mounted && label === 'Assignments' && assignments.length > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 7px',
                    lineHeight: '18px',
                  }}
                >
                  {assignments.length}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px' }}>
        <Link
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            borderRadius: 10,
            fontSize: 14,
            color: '#6b7280',
            textDecoration: 'none',
            marginBottom: 4,
          }}
        >
          <Settings size={17} style={{ color: '#9ca3af' }} />
          <span>Settings</span>
        </Link>

        {/* School profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>DPS</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Delhi Public School
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={9} />
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
