'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

type Stage = 'idle' | 'uploading' | 'generating' | 'done' | 'error'

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [dragging, setDragging] = useState(false)

  async function processFile(file: File) {
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

    setStage('uploading')
    setProgress(0)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const form = new FormData()
    form.append('file', file)
    form.append('plan', 'free')

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
        body: form,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail ?? '업로드 실패')
      }
      const data = await res.json()
      const sid = data.session_id
      setSessionId(sid)

      // 생성 시작
      setStage('generating')
      await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ session_id: sid, plan: 'free' }),
      })

      // 폴링
      await pollStatus(sid)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : '오류가 발생했습니다')
      setStage('error')
    }
  }

  async function pollStatus(sid: string) {
    while (true) {
      await new Promise(r => setTimeout(r, 2000))
      const res = await fetch(`${BACKEND_URL}/status/${sid}`)
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
    if (file) processFile(file)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-indigo-600">공부 도우미</Link>
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
              onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }}
            />
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
            <button
              onClick={() => { setStage('idle'); setErrorMsg('') }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
