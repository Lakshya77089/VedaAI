import { create } from 'zustand'
import {
  AssignmentListItem,
  AssignmentDetail,
  AssignmentStatus,
  IGeneratedContent,
  PaginationData,
} from '@/types/assignment'

interface GeneratingAssignment {
  id: string
  name: string
}

interface AssignmentStore {
  assignments: AssignmentListItem[]
  currentAssignment: AssignmentDetail | null
  generationStatus: Record<string, AssignmentStatus>
  isLoading: boolean
  isFetchingMore: boolean
  error: string | null
  pagination: PaginationData | null
  searchQuery: string

  // background generation tracking
  generatingAssignment: GeneratingAssignment | null
  readyNotification: GeneratingAssignment | null

  setAssignments: (assignments: AssignmentListItem[]) => void
  appendAssignments: (assignments: AssignmentListItem[]) => void
  addAssignment: (assignment: AssignmentListItem) => void
  setCurrentAssignment: (assignment: AssignmentDetail | null) => void
  updateGenerationStatus: (assignmentId: string, status: AssignmentStatus) => void
  setGeneratedContent: (assignmentId: string, content: IGeneratedContent) => void
  removeAssignment: (assignmentId: string) => void
  setLoading: (loading: boolean) => void
  setFetchingMore: (fetching: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  setPagination: (pagination: PaginationData) => void

  setGeneratingAssignment: (assignment: GeneratingAssignment | null) => void
  setReadyNotification: (assignment: GeneratingAssignment | null) => void
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  currentAssignment: null,
  generationStatus: {},
  isLoading: false,
  isFetchingMore: false,
  error: null,
  pagination: null,
  searchQuery: '',
  generatingAssignment: null,
  readyNotification: null,

  setAssignments: (assignments) => set({ assignments }),

  appendAssignments: (more) =>
    set((state) => ({ assignments: [...state.assignments, ...more] })),

  addAssignment: (assignment) =>
    set((state) => ({ assignments: [assignment, ...state.assignments] })),

  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),

  updateGenerationStatus: (id, status) =>
    set((state) => ({
      generationStatus: { ...state.generationStatus, [id]: status },
      assignments: state.assignments.map((a) =>
        a._id === id ? { ...a, status } : a
      ),
      currentAssignment:
        state.currentAssignment?._id === id
          ? { ...state.currentAssignment, status }
          : state.currentAssignment,
    })),

  setGeneratedContent: (id, content) =>
    set((state) => ({
      currentAssignment:
        state.currentAssignment?._id === id
          ? { ...state.currentAssignment, generatedContent: content, status: 'complete' }
          : state.currentAssignment,
    })),

  removeAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((a) => a._id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setFetchingMore: (isFetchingMore) => set({ isFetchingMore }),
  setError: (error) => set({ error }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setPagination: (pagination) => set({ pagination }),

  setGeneratingAssignment: (generatingAssignment) => set({ generatingAssignment }),
  setReadyNotification: (readyNotification) => set({ readyNotification }),
}))
