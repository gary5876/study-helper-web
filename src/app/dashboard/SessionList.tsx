'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

type Session = {
  id: string
  pdf_name: string
  status: string
  page_count: number
  word_count: number
  created_at: string
  subject_id: string | null
}

const STATUS_LABEL: Record<string, string> = {
  pending: '대기 중',
  processing: '생성 중',
  complete: '완료',
  failed: '실패',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  processing: 'bg-yellow-100 text-yellow-700',
  complete: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
}

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      try {
        const res = await fetch(`${BACKEND_URL}/user/sessions`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) setSessions(await res.json())
      } catch {
        // 백엔드 연결 실패 시 빈 목록
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📄</div>
        <p className="text-gray-500 mb-6">아직 학습 자료가 없습니다</p>
        <Link
          href="/upload"
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          첫 PDF 업로드하기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map(s => (
        <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{s.pdf_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {s.page_count}페이지 · {s.word_count.toLocaleString()}자 ·{' '}
              {new Date(s.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[s.status] ?? STATUS_COLOR.pending}`}>
              {STATUS_LABEL[s.status] ?? s.status}
            </span>
            {s.status === 'complete' && (
              <Link
                href={`/study/${s.id}`}
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                학습하기
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
