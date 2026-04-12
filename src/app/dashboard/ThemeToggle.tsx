'use client'

import { useTheme } from '@/lib/theme'

export default function ThemeToggle() {
  const { resolved, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={resolved === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {resolved === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
