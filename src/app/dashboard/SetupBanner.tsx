'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPlan, getApiKey } from '@/lib/apiSettings'

export default function SetupBanner() {
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    setNeedsSetup(!getPlan() || !getApiKey())
  }, [])

  if (!needsSetup) return null

  return (
    <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
      <div>
        <p className="text-sm font-medium text-amber-800">API 키 설정이 필요합니다</p>
        <p className="text-xs text-amber-600 mt-0.5">PDF 업로드를 사용하려면 AI 서비스 키를 먼저 등록해주세요.</p>
      </div>
      <Link
        href="/setup"
        className="ml-4 shrink-0 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
      >
        설정하기
      </Link>
    </div>
  )
}
