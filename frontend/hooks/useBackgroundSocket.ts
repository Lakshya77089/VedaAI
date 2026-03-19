'use client'

import { useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { useAssignmentStore } from '@/store/useAssignmentStore'
import { IGeneratedContent } from '@/types/assignment'

export function useBackgroundSocket() {
  const {
    generatingAssignment,
    setGeneratingAssignment,
    setReadyNotification,
    updateGenerationStatus,
    setGeneratedContent,
  } = useAssignmentStore()

  useEffect(() => {
    if (!generatingAssignment) return

    const socket = getSocket()
    const { id, name } = generatingAssignment

    socket.emit('subscribe:assignment', id)

    const onComplete = ({
      assignmentId,
      generatedContent,
    }: {
      assignmentId: string
      generatedContent: IGeneratedContent
    }) => {
      if (assignmentId !== id) return
      updateGenerationStatus(id, 'complete')
      setGeneratedContent(id, generatedContent)
      setGeneratingAssignment(null)
      setReadyNotification({ id, name })
    }

    const onError = ({ assignmentId }: { assignmentId: string }) => {
      if (assignmentId !== id) return
      updateGenerationStatus(id, 'error')
      setGeneratingAssignment(null)
    }

    socket.on('generation:complete', onComplete)
    socket.on('generation:error', onError)

    return () => {
      socket.off('generation:complete', onComplete)
      socket.off('generation:error', onError)
      socket.emit('unsubscribe:assignment', id)
    }
  }, [generatingAssignment, setGeneratingAssignment, setReadyNotification, updateGenerationStatus, setGeneratedContent])
}
