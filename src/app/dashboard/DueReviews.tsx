'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

type ReviewItem = {
  id: string
  session_id: string
  question_id: string
  question_type: 'mcq' | 'fill'
  next_review_at: string
  status: string
}

type SessionMeta = { id: string; pdf_name: string }

export default function DueReviews() {
  const { t } = useLang()
  const [loading, setLoading] = useState(true)
  const [grouped, setGrouped] = useState<Record<string, number>>({})
  const [sessionNames, setSessionNames] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) { setLoading(false); return }

    try {
      const [reviewsRes, sessionsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/user/review-schedule`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BACKEND_URL}/user/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (reviewsRes.ok) {
        const items: ReviewItem[] = await reviewsRes.json()
        const counts: Record<string, number> = {}
        for (const item of items) {
          if (item.status === 'done' || item.status === 'mastered') continue
          counts[item.session_id] = (counts[item.session_id] ?? 0) + 1
        }
        setGrouped(counts)
      }

      if (sessionsRes.ok) {
        const sessions: SessionMeta[] = await sessionsRes.json()
        const map: Record<string, string> = {}
        for (const s of sessions) map[s.id] = s.pdf_name
        setSessionNames(map)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return null

  const entries = Object.entries(grouped).filter(([, count]) => count > 0)
  const total = entries.reduce((acc, [, n]) => acc + n, 0)

  if (total === 0) return null

  return (
    <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-gray-900">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-bold text-indigo-800">🔔 {t.dashDueTitle}</p>
          <p className="text-xs text-indigo-700 mt-0.5">{t.dashDueSubtitle}</p>
        </div>
        <span className="shrink-0 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
          {t.dashDueCount.replace('{count}', String(total))}
        </span>
      </div>

      <ul className="space-y-2">
        {entries.map(([sessionId, count]) => {
          const name = sessionNames[sessionId] ?? t.dashDueSession
          return (
            <li
              key={sessionId}
              className="flex items-center justify-between gap-3 rounded-xl bg-white border border-indigo-100 px-4 py-2.5"
            >
              <span className="flex-1 min-w-0 truncate text-sm font-medium text-gray-900">{name}</span>
              <span className="shrink-0 text-xs text-indigo-700 font-semibold">
                {t.dashDueCount.replace('{count}', String(count))}
              </span>
              <Link
                href={`/study/${sessionId}`}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                {t.dashDueStudy}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
