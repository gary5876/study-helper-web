'use client'

import { createContext, useContext, useCallback, useSyncExternalStore, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'sh_theme'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.remove('dark')
}

const themeListeners = new Set<() => void>()
function notifyTheme() {
  themeListeners.forEach(l => l())
}

function subscribeTheme(cb: () => void) {
  themeListeners.add(cb)
  if (typeof window === 'undefined') {
    return () => { themeListeners.delete(cb) }
  }
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', cb)
  return () => {
    themeListeners.delete(cb)
    mq.removeEventListener('change', cb)
  }
}

function getThemeSnapshot(): Theme {
  return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
}
function getThemeServerSnapshot(): Theme {
  return 'system'
}

function getResolvedSnapshot(): 'light' | 'dark' {
  const stored = (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
  if (stored === 'light' || stored === 'dark') return stored
  return getSystemTheme()
}
function getResolvedServerSnapshot(): 'light' | 'dark' {
  return 'light'
}

interface ThemeContextType {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot)
  const resolved = useSyncExternalStore(subscribeTheme, getResolvedSnapshot, getResolvedServerSnapshot)

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t)
    applyTheme()
    notifyTheme()
  }, [])

  const toggle = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }, [resolved, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
