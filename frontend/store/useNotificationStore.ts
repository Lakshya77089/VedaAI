import { create } from 'zustand'
import axios from 'axios'

export interface Notification {
  _id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  assignmentId?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const { data } = await axios.get(`${API_BASE}/notifications`)
      set({ 
        notifications: data, 
        unreadCount: data.filter((n: Notification) => !n.read).length,
        isLoading: false 
      })
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      set({ isLoading: false })
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1)
    }))
  },

  markAsRead: async (id) => {
    try {
      await axios.patch(`${API_BASE}/notifications/${id}/read`)
      set((state) => ({
        notifications: state.notifications.map((n) => 
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  },

  markAllAsRead: async () => {
    try {
      await axios.patch(`${API_BASE}/notifications/read-all`)
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0
      }))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }
}))
