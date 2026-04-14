'use client'

import { useState } from 'react'

export interface FillQuestion {
  id: string
  sentence_with_blank: string
  answer: string
  acceptable_variants: string[]
  hint: string
  concept_id: string
  level: number
  question_type: 'concept' | 'application'
}

interface Props {
  question: FillQuestion
  current: number
  total: number
  onAnswer: (questionId: string, userAnswer: string, isCorrect: boolean) => void
  onNext: () => void
  isLast: boolean
}

const LEVEL_STYLE: Record<number, string> = {
  1: 'bg-blue-50 text-blue-700',
  2: 'bg-teal-50 text-teal-700',
  3: 'bg-amber-50 text-amber-700',
  4: 'bg-orange-50 text-orange-700',
  5: 'bg-red-50 text-red-700',
}

const TYPE_LABEL: Record<string, string> = {
  concept: '개념',
  application: '실습',
}

function fuzzyMatch(a: string, b: string, threshold = 0.8): boolean {
  const sa = a.trim().toLowerCase()
  const sb = b.trim().toLowerCase()
  if (sa === sb) return true
  const dp: number[][] = Array.from({ length: sa.length + 1 }, (_, i) =>
    Array.from({ length: sb.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= sa.length; i++) {
    for (let j = 1; j <= sb.length; j++) {
      dp[i][j] = sa[i - 1] === sb[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  const maxLen = Math.max(sa.length, sb.length)
  return 1 - dp[sa.length][sb.length] / maxLen >= threshold
}

export default function FillCard({ question: q, current, total, onAnswer, onNext, isLast }: Props) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const levelStyle = LEVEL_STYLE[q.level] ?? LEVEL_STYLE[3]
  const parts = q.sentence_with_blank.split('___')

  function handleSubmit() {
    if (!input.trim() || submitted) return
    const correct =
      fuzzyMatch(input, q.answer) ||
      (q.acceptable_variants ?? []).some((v) => fuzzyMatch(input, v))
    setIsCorrect(correct)
    setSubmitted(true)
    onAnswer(q.id, input.trim(), correct)
  }

  function handleNext() {
    setInput('')
    setSubmitted(false)
    setIsCorrect(false)
    setShowHint(false)
    onNext()
  }

  return (
    <div className="bg-white text-gray-900 rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm">
      {/* Progress + badges */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-600 font-medium">{current} / {total}</span>
        <div className="flex gap-2">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${levelStyle}`}>
            Lv.{q.level}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
            {TYPE_LABEL[q.question_type] ?? q.question_type}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>

      {/* Sentence with blank */}
      <p className="text-base leading-relaxed text-gray-800">
        {parts[0]}
        <span className="inline-block mx-1 px-3 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold tracking-widest border-b-2 border-indigo-400">___</span>
        {parts[1] ?? ''}
      </p>

      {/* Hint */}
      {!showHint && q.hint && !submitted && (
        <button
          onClick={() => setShowHint(true)}
          className="self-start text-xs text-indigo-500 underline"
        >
          힌트 보기
        </button>
      )}
      {showHint && q.hint && (
        <p className="text-xs text-yellow-900 italic bg-yellow-50 rounded-lg px-3 py-2">
          💡 {q.hint}
        </p>
      )}

      {/* Input */}
      {!submitted && (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="답을 입력하세요…"
            className="flex-1 border-2 border-indigo-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            autoComplete="off"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            제출
          </button>
        </div>
      )}

      {/* Feedback */}
      {submitted && (
        <div className={`rounded-xl p-4 text-sm leading-relaxed ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {isCorrect
            ? <p className="font-semibold">정답입니다! 잘 했어요.</p>
            : <p><span className="font-semibold">정답: </span>{q.answer}</p>
          }
        </div>
      )}

      {submitted && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          {isLast ? '결과 보기' : '다음 문제'}
        </button>
      )}
    </div>
  )
}
