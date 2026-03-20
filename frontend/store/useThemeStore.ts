import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: (typeof window !== 'undefined'
    ? (localStorage.getItem('vedaai-theme') as Theme) || 'light'
    : 'light'),

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light'
      if (typeof window !== 'undefined') {
        localStorage.setItem('vedaai-theme', next)
        document.documentElement.setAttribute('data-theme', next)
      }
      return { theme: next }
    }),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vedaai-theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
    set({ theme })
  },
}))
