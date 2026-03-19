'use client'

import { useCallback, useRef } from 'react'
import api from '@/lib/api'
import { useAssignmentStore } from '@/store/useAssignmentStore'

export function useAssignments() {
  const latestFetchIdRef = useRef(0)
  const latestMoreFetchIdRef = useRef(0)

  const {
    setAssignments, appendAssignments, setPagination,
    setLoading, setFetchingMore, setError, removeAssignment,
  } = useAssignmentStore()

  const fetchAssignments = useCallback(
    async (page = 1, limit = 10, search = '') => {
      const fetchId = ++latestFetchIdRef.current
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/assignments', { params: { page, limit, search } })
        if (fetchId !== latestFetchIdRef.current) return
        setAssignments(data.data.assignments)
        setPagination(data.data.pagination)
      } catch (err: unknown) {
        if (fetchId !== latestFetchIdRef.current) return
        setError(err instanceof Error ? err.message : 'Failed to load assignments')
      } finally {
        if (fetchId === latestFetchIdRef.current) setLoading(false)
      }
    },
    [setAssignments, setPagination, setLoading, setError]
  )

  const fetchMoreAssignments = useCallback(
    async (page: number, limit = 10, search = '') => {
      const fetchId = ++latestMoreFetchIdRef.current
      setFetchingMore(true)
      try {
        const { data } = await api.get('/assignments', { params: { page, limit, search } })
        if (fetchId !== latestMoreFetchIdRef.current) return
        appendAssignments(data.data.assignments)
        setPagination(data.data.pagination)
      } catch {
        if (fetchId !== latestMoreFetchIdRef.current) return
        // silently fail — user can scroll again to retry
      } finally {
        if (fetchId === latestMoreFetchIdRef.current) setFetchingMore(false)
      }
    },
    [appendAssignments, setPagination, setFetchingMore]
  )

  const deleteAssignment = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/assignments/${id}`)
        removeAssignment(id)
      } catch (err: unknown) {
        throw new Error(err instanceof Error ? err.message : 'Failed to delete assignment')
      }
    },
    [removeAssignment]
  )

  return { fetchAssignments, fetchMoreAssignments, deleteAssignment }
}
