'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Users, BookOpen, Sparkles } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Home', icon: LayoutGrid },
  { href: '/groups', label: 'My Groups', icon: Users },
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/toolkit', label: 'AI Toolkit', icon: Sparkles },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 68,
        backgroundColor: '#111827',
        display: 'flex',
        alignItems: 'center',
        zIndex: 40,
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderRadius: '20px 20px 0 0',
      }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              textDecoration: 'none',
              padding: '8px 0',
            }}
          >
            <Icon
              size={22}
              style={{ color: isActive ? 'white' : '#6b7280' }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'white' : '#6b7280',
              }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
