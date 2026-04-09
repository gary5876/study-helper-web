'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ModeSelect, { StudyMode } from './components/ModeSelect'
import MCQCard, { MCQQuestion } from './components/MCQCard'
import FillCard, { FillQuestion } from './components/FillCard'
import ScoreSummary from './components/ScoreSummary'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

type Phase = 'loading' | 'error' | 'modeSelect' | 'mcq' | 'fill' | 'score'

interface StudyContent {
  session_id: string
  mcq_questions: MCQQuestion[]
  fill_questions: FillQuestion[]
}

const MODE_LEVELS: Record<StudyMode, number[]> = {
  light: [1, 2],
  exam: [3, 4, 5],
  max: [5],
}
const MODE_MIN = 3

function filterByMode<T extends { level: number }>(items: T[], mode: StudyMode): T[] {
  const primary = MODE_LEVELS[mode]
  const filtered = items.filter((q) => primary.includes(q.level))
  if (filtered.length >= MODE_MIN) return filtered
  if (mode === 'max') return items.filter((q) => q.level >= 4)
  if (mode === 'light') return items.filter((q) => q.level <= 3)
  return filtered
}

export default function StudyPage() {
  const params = useParams()
  const sessionId = params.sessionId as string

  const [phase, setPhase] = useState<Phase>('loading')
  const [content, setContent] = useState<StudyContent | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [mode, setMode] = useState<StudyMode>('exam')
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([])
  const [fillQuestions, setFillQuestions] = useState<FillQuestion[]>([])

  const [mcqIndex, setMcqIndex] = useState(0)
  const [fillIndex, setFillIndex] = useState(0)
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BACKEND_URL}/result/${sessionId}`)
        if (!res.ok) throw new Error(`서버 오류: ${res.status}`)
        const data: StudyContent = await res.json()
        setContent(data)
        setPhase('modeSelect')
      } catch (e: unknown) {
        setErrorMsg(e instanceof Error ? e.message : '학습 자료를 불러올 수 없습니다.')
        setPhase('error')
      }
    }
    load()
  }, [sessionId])

  function handleModeSelect(selected: StudyMode) {
    if (!content) return
    setMode(selected)
    setMcqQuestions(filterByMode(content.mcq_questions, selected))
    setFillQuestions(filterByMode(content.fill_questions, selected))
    setMcqIndex(0)
    setFillIndex(0)
    setAnswers([])
    setPhase('mcq')
  }

  function handleMCQAnswer(_id: string, _choice: string, isCorrect: boolean) {
    setAnswers((prev) => [...prev, { correct: isCorrect }])
  }

  function handleMCQNext() {
    if (mcqIndex < mcqQuestions.length - 1) {
      setMcqIndex((i) => i + 1)
    } else {
      setFillIndex(0)
      setPhase('fill')
    }
  }

  function handleFillAnswer(_id: string, _answer: string, isCorrect: boolean) {
    setAnswers((prev) => [...prev, { correct: isCorrect }])
  }

  function handleFillNext() {
    if (fillIndex < fillQuestions.length - 1) {
      setFillIndex((i) => i + 1)
    } else {
      setPhase('score')
    }
  }

  function handleRetry() {
    setPhase('modeSelect')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">학습 자료를 불러오는 중…</p>
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <p className="text-5xl mb-4">❌</p>
          <p className="font-semibold text-gray-800 mb-2">불러오기 실패</p>
          <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
          <Link href="/dashboard" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            대시보드로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-indigo-600 font-medium hover:underline">
            ← 대시보드
          </Link>
          {phase !== 'modeSelect' && phase !== 'score' && (
            <button
              onClick={() => setPhase('modeSelect')}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              모드 변경
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {phase === 'modeSelect' && (
          <ModeSelect onSelect={handleModeSelect} />
        )}

        {phase === 'mcq' && mcqQuestions.length > 0 && (
          <MCQCard
            question={mcqQuestions[mcqIndex]}
            current={mcqIndex + 1}
            total={mcqQuestions.length + fillQuestions.length}
            onAnswer={handleMCQAnswer}
            onNext={handleMCQNext}
            isLast={mcqIndex === mcqQuestions.length - 1 && fillQuestions.length === 0}
          />
        )}

        {phase === 'fill' && fillQuestions.length > 0 && (
          <FillCard
            question={fillQuestions[fillIndex]}
            current={mcqQuestions.length + fillIndex + 1}
            total={mcqQuestions.length + fillQuestions.length}
            onAnswer={handleFillAnswer}
            onNext={handleFillNext}
            isLast={fillIndex === fillQuestions.length - 1}
          />
        )}

        {phase === 'score' && (
          <ScoreSummary
            correct={answers.filter((a) => a.correct).length}
            total={answers.length}
            mode={mode}
            sessionId={sessionId}
            onRetry={handleRetry}
          />
        )}
      </main>
    </div>
  )
}
