'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'sh_theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const resolved = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

interface ThemeContextType {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = getStoredTheme()
    setThemeState(stored)
    const r = stored === 'system' ? getSystemTheme() : stored
    setResolved(r)
    applyTheme(stored)

    // Listen for system theme changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function handleChange() {
      if (getStoredTheme() === 'system') {
        const sys = getSystemTheme()
        setResolved(sys)
        applyTheme('system')
      }
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEY, t)
    const r = t === 'system' ? getSystemTheme() : t
    setResolved(r)
    applyTheme(t)
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
