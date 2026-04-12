'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'

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

type Subject = {
  id: string
  name: string
  color: string
  created_at: string
}

function useStatusLabel() {
  const { t } = useLang()
  return {
    pending: t.dashStatusPending,
    processing: t.dashStatusProcessing,
    complete: t.dashStatusComplete,
    failed: t.dashStatusFailed,
  } as Record<string, string>
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  processing: 'bg-yellow-100 text-yellow-700',
  complete: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
}

const UNCATEGORIZED = '__uncategorized__'

export default function SessionList() {
  const { t } = useLang()
  const STATUS_LABEL = useStatusLabel()
  const [sessions, setSessions] = useState<Session[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<string | null>(null) // null = all
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [saving, setSaving] = useState(false)

  const getToken = useCallback(async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }, [])

  useEffect(() => {
    async function load() {
      const token = await getToken()
      if (!token) { setLoading(false); return }

      try {
        const [sessRes, subjRes] = await Promise.all([
          fetch(`${BACKEND_URL}/user/sessions`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BACKEND_URL}/user/subjects`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (sessRes.ok) setSessions(await sessRes.json())
        if (subjRes.ok) setSubjects(await subjRes.json())
      } catch {
        // 백엔드 연결 실패 시 빈 목록
      }
      setLoading(false)
    }
    load()
  }, [getToken])

  const filteredSessions = useMemo(() => {
    if (selectedTab === null) return sessions
    if (selectedTab === UNCATEGORIZED) return sessions.filter(s => !s.subject_id)
    return sessions.filter(s => s.subject_id === selectedTab)
  }, [sessions, selectedTab])

  const subjectMap = useMemo(() => {
    const map: Record<string, Subject> = {}
    for (const s of subjects) map[s.id] = s
    return map
  }, [subjects])

  async function handleAddSubject() {
    const name = newSubjectName.trim()
    if (!name) return
    setSaving(true)
    const token = await getToken()
    if (!token) { setSaving(false); return }
    try {
      const res = await fetch(`${BACKEND_URL}/user/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, color: '#6c63ff' }),
      })
      if (res.ok) {
        const created = await res.json()
        setSubjects(prev => [...prev, created])
        setNewSubjectName('')
        setShowAddModal(false)
      }
    } catch { /* ignore */ }
    setSaving(false)
  }

  async function handleDeleteSubject(id: string) {
    if (!confirm(t.subDeleteConfirm)) return
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch(`${BACKEND_URL}/user/subjects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok || res.status === 204) {
        setSubjects(prev => prev.filter(s => s.id !== id))
        setSessions(prev => prev.map(s => s.subject_id === id ? { ...s, subject_id: null } : s))
        if (selectedTab === id) setSelectedTab(null)
      }
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (sessions.length === 0 && subjects.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📄</div>
        <p className="text-gray-500 mb-6">{t.dashNoSessions}</p>
        <Link
          href="/upload"
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {t.dashFirstUpload}
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Subject Tab Bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedTab(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedTab === null
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300'
          }`}
        >
          {t.subAll}
        </button>
        <button
          onClick={() => setSelectedTab(UNCATEGORIZED)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedTab === UNCATEGORIZED
              ? 'bg-gray-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          {t.subUncategorized}
        </button>
        {subjects.map(sub => (
          <div key={sub.id} className="relative group flex items-center">
            <button
              onClick={() => setSelectedTab(sub.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTab === sub.id
                  ? 'text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
              style={selectedTab === sub.id ? { backgroundColor: sub.color } : undefined}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: sub.color }}
              />
              {sub.name}
            </button>
            <button
              onClick={() => handleDeleteSubject(sub.id)}
              className="hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs absolute -top-1 -right-1 hover:bg-red-200"
              title="과목 삭제"
            >
              x
            </button>
          </div>
        ))}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          {t.subAddSubject}
        </button>
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm mx-4 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t.subAddTitle}</h3>
            <input
              type="text"
              value={newSubjectName}
              onChange={e => setNewSubjectName(e.target.value)}
              placeholder={t.subNamePlaceholder}
              maxLength={30}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleAddSubject() }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowAddModal(false); setNewSubjectName('') }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleAddSubject}
                disabled={!newSubjectName.trim() || saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? '...' : t.subCreate}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session list */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">{t.subNoneInCategory}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map(s => {
            const subject = s.subject_id ? subjectMap[s.subject_id] : null
            return (
              <div key={s.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{s.pdf_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {subject ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: subject.color + '22', color: subject.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subject.color }} />
                        {subject.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 px-2 py-0.5 rounded-full bg-gray-50">{t.subUncategorized}</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {s.page_count} {t.dashPages} · {s.word_count.toLocaleString()} {t.dashWords} ·{' '}
                      {new Date(s.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
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
                      {t.dashStudy}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
