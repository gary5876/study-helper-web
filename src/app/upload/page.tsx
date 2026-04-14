'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getPlan, getApiKey, getModel } from '@/lib/apiSettings'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

type Subject = { id: string; name: string; color: string }
type Stage = 'idle' | 'subject_select' | 'uploading' | 'generating' | 'done' | 'error'

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [dragging, setDragging] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [showNewSubject, setShowNewSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')

  useEffect(() => {
    if (!getPlan() || !getApiKey()) {
      router.replace('/setup')
      return
    }
    // Load subjects
    async function loadSubjects() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      try {
        const res = await fetch(`${BACKEND_URL}/user/subjects`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) setSubjects(await res.json())
      } catch { /* ignore */ }
    }
    loadSubjects()
  }, [router])

  function handleFileSelected(file: File) {
    if (!file.name.endsWith('.pdf')) {
      setErrorMsg('PDF 파일만 업로드 가능합니다.')
      setStage('error')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('파일 크기가 20MB를 초과합니다.')
      setStage('error')
      return
    }
    setPendingFile(file)
    setStage('subject_select')
  }

  async function handleConfirmSubject() {
    if (!pendingFile) return
    let subjectId = selectedSubjectId

    // Create new subject if needed
    if (showNewSubject && newSubjectName.trim()) {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        try {
          const res = await fetch(`${BACKEND_URL}/user/subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ name: newSubjectName.trim(), color: '#6c63ff' }),
          })
          if (res.ok) {
            const created = await res.json()
            subjectId = created.id
            setSubjects(prev => [...prev, created])
          }
        } catch { /* ignore */ }
      }
    }

    processFile(pendingFile, subjectId)
  }

  async function processFile(file: File, subjectId?: string | null) {
    if (!file.name.endsWith('.pdf')) {
      setErrorMsg('PDF 파일만 업로드 가능합니다.')
      setStage('error')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('파일 크기가 20MB를 초과합니다. PDF를 분할하거나 이미지 품질을 낮춰 내보내세요.')
      setStage('error')
      return
    }

    const plan = getPlan()
    const apiKey = getApiKey()
    if (!plan || !apiKey) {
      router.replace('/setup')
      return
    }
    const model = getModel(plan)

    setStage('uploading')
    setProgress(0)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const form = new FormData()
    form.append('file', file)
    form.append('plan', plan)
    if (subjectId) form.append('subject_id', subjectId)

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: form,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail ?? '업로드 실패')
      }
      const data = await res.json()
      const sid = data.session_id
      setSessionId(sid)

      setStage('generating')
      await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ session_id: sid, plan, options: { model } }),
      })

      await pollStatus(sid, session?.access_token)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : '오류가 발생했습니다')
      setStage('error')
    }
  }

  async function pollStatus(sid: string, accessToken?: string) {
    while (true) {
      await new Promise(r => setTimeout(r, 2000))
      const res = await fetch(`${BACKEND_URL}/status/${sid}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
      if (!res.ok) continue
      const data = await res.json()
      setProgress(data.progress_pct ?? 0)
      if (data.status === 'complete') {
        setStage('done')
        return
      }
      if (data.status === 'failed') {
        setErrorMsg(data.error_message ?? '생성 실패')
        setStage('error')
        return
      }
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelected(file)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-indigo-600">공부 도우미</Link>
          <Link href="/setup" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            API 키 설정
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">PDF 업로드</h1>
        <p className="text-gray-500 text-sm mb-8">PDF를 업로드하면 AI가 학습 노트, 객관식, 빈칸 문제를 자동으로 생성합니다.</p>

        {stage === 'idle' && (
          <div
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors ${
              dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-5xl mb-4">📄</div>
            <p className="font-medium text-gray-700 mb-1">PDF를 드래그하거나 클릭해서 선택</p>
            <p className="text-sm text-gray-400">최대 20MB · 최대 50페이지</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelected(f) }}
            />
          </div>
        )}

        {stage === 'subject_select' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">어떤 과목인가요?</h2>
            <p className="text-sm text-gray-500 mb-6">과목을 선택하거나 새로 만드세요.</p>

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => { setSelectedSubjectId(null); setShowNewSubject(false) }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSubjectId === null && !showNewSubject
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                미분류
              </button>
              {subjects.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => { setSelectedSubjectId(sub.id); setShowNewSubject(false) }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSubjectId === sub.id
                      ? 'text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                  style={selectedSubjectId === sub.id ? { backgroundColor: sub.color } : undefined}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: sub.color }} />
                  {sub.name}
                </button>
              ))}
              <button
                onClick={() => { setShowNewSubject(true); setSelectedSubjectId(null) }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border border-dashed ${
                  showNewSubject
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                + 새 과목
              </button>
            </div>

            {showNewSubject && (
              <input
                type="text"
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                placeholder="과목명 입력..."
                maxLength={30}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                autoFocus
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setStage('idle'); setPendingFile(null); setShowNewSubject(false); setNewSubjectName('') }}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmSubject}
                disabled={showNewSubject && !newSubjectName.trim()}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                생성 시작
              </button>
            </div>
          </div>
        )}

        {(stage === 'uploading' || stage === 'generating') && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-4">{stage === 'uploading' ? '⬆️' : '🤖'}</div>
            <p className="font-medium text-gray-800 mb-1">
              {stage === 'uploading' ? 'PDF 업로드 중...' : 'AI가 학습 자료를 생성하고 있습니다...'}
            </p>
            <p className="text-sm text-gray-400 mb-6">잠시만 기다려주세요 (보통 30초~2분)</p>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stage === 'uploading' ? 10 : Math.max(15, progress)}%` }}
              />
            </div>
            {progress > 0 && (
              <p className="text-xs text-gray-400 mt-2">{progress}%</p>
            )}
          </div>
        )}

        {stage === 'done' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="font-medium text-gray-800 mb-6">학습 자료가 생성됐습니다!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`${BACKEND_URL}/result/${sessionId}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                결과 보기
              </a>
              <button
                onClick={() => { setStage('idle'); setSessionId(''); setProgress(0) }}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                다른 PDF 업로드
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                대시보드로
              </Link>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <p className="font-medium text-red-600 mb-2">오류가 발생했습니다</p>
            <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setStage('idle'); setErrorMsg('') }}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                다시 시도
              </button>
              <Link
                href="/setup"
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                API 키 확인
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
