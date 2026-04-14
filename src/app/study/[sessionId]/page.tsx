'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import ModeSelect, { StudyMode } from './components/ModeSelect'
import MCQCard, { MCQQuestion } from './components/MCQCard'
import FillCard, { FillQuestion } from './components/FillCard'
import ScoreSummary from './components/ScoreSummary'
import StudyNotes, { StudyNotesData, KeyConcept } from './components/StudyNotes'
import WrongAnswerReview, { WrongAnswer } from './components/WrongAnswerReview'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

type Phase = 'loading' | 'error' | 'notes' | 'modeSelect' | 'mcq' | 'fill' | 'score' | 'wrongReview' | 'conceptReview'

interface StudyContent {
  session_id: string
  notes: StudyNotesData
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
  const { t } = useLang()

  const [phase, setPhase] = useState<Phase>('loading')
  const [content, setContent] = useState<StudyContent | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [mode, setMode] = useState<StudyMode>('exam')
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([])
  const [fillQuestions, setFillQuestions] = useState<FillQuestion[]>([])

  const [mcqIndex, setMcqIndex] = useState(0)
  const [fillIndex, setFillIndex] = useState(0)
  const [answers, setAnswers] = useState<{ correct: boolean; questionId: string; userAnswer: string }[]>([])
  const [selectedConcept, setSelectedConcept] = useState<KeyConcept | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch(`${BACKEND_URL}/result/${sessionId}`, {
          headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
        })
        if (!res.ok) throw new Error(`서버 오류: ${res.status}`)
        const data: StudyContent = await res.json()
        setContent(data)
        setPhase(data.notes ? 'notes' : 'modeSelect')
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

  function handleMCQAnswer(id: string, choice: string, isCorrect: boolean) {
    setAnswers((prev) => [...prev, { correct: isCorrect, questionId: id, userAnswer: choice }])
  }

  function handleMCQNext() {
    if (mcqIndex < mcqQuestions.length - 1) {
      setMcqIndex((i) => i + 1)
    } else {
      setFillIndex(0)
      setPhase('fill')
    }
  }

  function handleFillAnswer(id: string, answer: string, isCorrect: boolean) {
    setAnswers((prev) => [...prev, { correct: isCorrect, questionId: id, userAnswer: answer }])
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

  function getWrongAnswers(): WrongAnswer[] {
    if (!content) return []
    const allQ = [...content.mcq_questions, ...content.fill_questions]
    return answers
      .filter(a => !a.correct)
      .map(a => {
        const question = allQ.find(q => q.id === a.questionId)
        if (!question) return null
        const type = 'options' in question ? 'mcq' as const : 'fill' as const
        return { questionId: a.questionId, userAnswer: a.userAnswer, question, type }
      })
      .filter((x): x is WrongAnswer => x !== null)
  }

  function handleReviewWrong() {
    setPhase('wrongReview')
  }

  function handleViewConcept(concept: KeyConcept) {
    setSelectedConcept(concept)
    setPhase('conceptReview')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <p className="text-5xl mb-4">❌</p>
          <p className="font-semibold text-gray-800 mb-2">{t.studyLoadFailed}</p>
          <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
          <Link href="/dashboard" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            대시보드로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-indigo-600 font-medium hover:underline">
            {t.studyBackToDashboard}
          </Link>
          <div className="flex items-center gap-3">
            {phase !== 'notes' && content?.notes && (
              <button
                onClick={() => setPhase('notes')}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                {t.studyNotes}
              </button>
            )}
            {phase !== 'modeSelect' && phase !== 'score' && phase !== 'notes' && (
              <button
                onClick={() => setPhase('modeSelect')}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                {t.studyChangeMode}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {phase === 'notes' && content?.notes && (
          <StudyNotes notes={content.notes} onStartQuiz={() => setPhase('modeSelect')} />
        )}

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
            hasWrongAnswers={answers.some(a => !a.correct)}
            onReviewWrong={handleReviewWrong}
          />
        )}

        {phase === 'wrongReview' && (
          <WrongAnswerReview
            wrongAnswers={getWrongAnswers()}
            sessionId={sessionId}
            concepts={content?.notes?.key_concepts ?? []}
            onDone={() => setPhase('notes')}
            onRetryConfused={() => setPhase('modeSelect')}
            onViewConcept={handleViewConcept}
          />
        )}

        {phase === 'conceptReview' && selectedConcept && content?.notes && (
          <div className="max-w-2xl mx-auto py-6 px-4">
            <button
              onClick={() => setPhase('wrongReview')}
              className="text-sm text-indigo-600 hover:underline mb-4 inline-block"
            >
              ← 복습으로 돌아가기
            </button>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedConcept.term}</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  selectedConcept.importance === 'high' ? 'bg-red-50 text-red-700'
                  : selectedConcept.importance === 'medium' ? 'bg-orange-50 text-orange-700'
                  : 'bg-green-50 text-green-700'
                }`}>
                  {selectedConcept.importance === 'high' ? '높음' : selectedConcept.importance === 'medium' ? '보통' : '낮음'} 중요도
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">{selectedConcept.definition}</p>

              {/* Related Sections */}
              {(() => {
                const related = content.notes.sections.filter(sec =>
                  sec.title.toLowerCase().includes(selectedConcept.term.toLowerCase()) ||
                  sec.summary.toLowerCase().includes(selectedConcept.term.toLowerCase()) ||
                  sec.bullets.some(b => b.toLowerCase().includes(selectedConcept.term.toLowerCase()))
                )
                if (related.length === 0) return null
                return (
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-gray-800 mb-3">관련 섹션</h3>
                    {related.map((sec, i) => (
                      <div key={i} className="mb-3">
                        <p className="font-medium text-gray-900">{sec.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{sec.summary}</p>
                        {sec.bullets.length > 0 && (
                          <ul className="list-disc pl-5 mt-1 space-y-0.5">
                            {sec.bullets.map((b, j) => (
                              <li key={j} className="text-sm text-gray-500">{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* Glossary match */}
              {(() => {
                const match = content.notes.glossary.find(
                  g => g.term.toLowerCase() === selectedConcept.term.toLowerCase()
                )
                if (!match) return null
                return (
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-gray-800 mb-2">용어집</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{match.term}</span> — {match.brief_def}
                    </p>
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
