'use client'

import { useLang } from '@/lib/i18n'

export default function LangToggle() {
  const { lang, toggle } = useLang()
  return (
    <button
      onClick={toggle}
      className="text-sm text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors"
      title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      {lang === 'ko' ? 'EN' : '한'}
    </button>
  )
}
