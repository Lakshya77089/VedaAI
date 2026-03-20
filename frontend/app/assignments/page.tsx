'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import AssignmentGrid from '@/components/assignments/AssignmentGrid'
import SearchBar from '@/components/assignments/SearchBar'
import AssignmentsShimmer from '@/components/assignments/AssignmentsShimmer'
import { useAssignmentStore } from '@/store/useAssignmentStore'
import { useAssignments } from '@/hooks/useAssignments'
import { useSocket } from '@/hooks/useSocket'
import api from '@/lib/api'
import { useToast } from '@/context/ToastContext'

const PAGE_LIMIT = 10

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'complete', label: 'Complete' },
  { value: 'error', label: 'Error' },
] as const

export default function AssignmentsPage() {
  const {
    assignments, isLoading, isFetchingMore, error,
    searchQuery, setSearchQuery, pagination,
  } = useAssignmentStore()
  const { fetchAssignments, fetchMoreAssignments, deleteAssignment } = useAssignments()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)
  const [statusFilter, setStatusFilter] = useState('all')

  useSocket()

  // Debounce search so we don't spam GET /assignments on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  // Initial load + re-fetch on debounced search change or status filter change
  useEffect(() => {
    fetchAssignments(1, PAGE_LIMIT, debouncedSearchQuery, statusFilter)
  }, [fetchAssignments, debouncedSearchQuery, statusFilter])

  const hasMore = pagination ? pagination.page < pagination.totalPages : false

  const handleLoadMore = useCallback(() => {
    if (!pagination || isFetchingMore) return
    fetchMoreAssignments(pagination.page + 1, PAGE_LIMIT, debouncedSearchQuery, statusFilter)
  }, [pagination, isFetchingMore, debouncedSearchQuery, statusFilter, fetchMoreAssignments])

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id)
    } catch {
      setDeleteError('Failed to delete assignment. Please try again.')
      setTimeout(() => setDeleteError(null), 3000)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/assignments/${id}/duplicate`)
      // Refresh the list to show the new clone
      fetchAssignments(1, PAGE_LIMIT, debouncedSearchQuery, statusFilter)
    } catch {
      setDeleteError('Failed to duplicate assignment. Please try again.')
      setTimeout(() => setDeleteError(null), 3000)
    }
  }

  return (
    <AppShell>
      <div style={{ padding: '28px 24px 100px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)' }}>Assignments</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Manage and create assignments for your classes.
          </p>
        </div>

        {/* Search + filter row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />

          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 50,
                    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: active ? 'var(--color-primary)' : 'var(--color-card-bg)',
                    color: active ? 'white' : 'var(--color-text-secondary)',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {(error || deleteError) && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 10,
              backgroundColor: '#fff5f5',
              color: '#dc2626',
              fontSize: 14,
              border: '1px solid #fecaca',
            }}
          >
            {error || deleteError}
          </div>
        )}

        {/* Cards */}
        {isLoading ? (
          <AssignmentsShimmer />
        ) : (
          <AssignmentGrid
            assignments={assignments}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            hasMore={hasMore}
            isFetchingMore={isFetchingMore}
            onLoadMore={handleLoadMore}
          />
        )}
      </div>

      {/* Floating create pill — desktop only */}
      {assignments.length > 0 && !isLoading && (
        <Link
          href="/assignments/create"
          className="desktop-only"
          style={{
            position: 'fixed',
            bottom: 28,
            left: 'calc(50% + 120px)',
            transform: 'translateX(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '12px 24px',
            backgroundColor: '#111827',
            color: 'white',
            borderRadius: 50,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 20,
          }}
        >
          <Plus size={16} />
          Create Assignment
        </Link>
      )}
    </AppShell>
  )
}
