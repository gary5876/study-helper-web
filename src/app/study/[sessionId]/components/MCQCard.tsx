'use client'

import { useState } from 'react'

export interface MCQQuestion {
  id: string
  question: string
  options: { A: string; B: string; C: string; D: string }
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  concept_id: string
  level: number
  question_type: 'concept' | 'application'
}

type Option = 'A' | 'B' | 'C' | 'D'

interface Props {
  question: MCQQuestion
  current: number
  total: number
  onAnswer: (questionId: string, choice: string, isCorrect: boolean) => void
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

export default function MCQCard({ question: q, current, total, onAnswer, onNext, isLast }: Props) {
  const [selected, setSelected] = useState<Option | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const levelStyle = LEVEL_STYLE[q.level] ?? LEVEL_STYLE[3]

  function handleSelect(opt: Option) {
    if (submitted) return
    setSelected(opt)
    setSubmitted(true)
    onAnswer(q.id, opt, opt === q.correct_answer)
  }

  function handleNext() {
    setSelected(null)
    setSubmitted(false)
    onNext()
  }

  function optionClass(opt: Option) {
    const base = 'flex items-center gap-3 w-full text-left rounded-xl border-2 p-3.5 transition-colors text-sm'
    if (!submitted) {
      return `${base} border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer`
    }
    if (opt === q.correct_answer) return `${base} border-green-400 bg-green-50 text-green-800`
    if (opt === selected) return `${base} border-red-400 bg-red-50 text-red-800`
    return `${base} border-gray-100 bg-gray-50 text-gray-500 opacity-70`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm">
      {/* Progress + badges */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400 font-medium">{current} / {total}</span>
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

      {/* Question */}
      <p className="font-semibold text-gray-900 text-base leading-relaxed">{q.question}</p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {(['A', 'B', 'C', 'D'] as Option[]).map((opt) => (
          <button key={opt} onClick={() => handleSelect(opt)} className={optionClass(opt)} disabled={submitted}>
            <span className="w-6 h-6 flex-shrink-0 rounded-full border border-current flex items-center justify-center font-bold text-xs">
              {opt}
            </span>
            <span>{q.options[opt]}</span>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {submitted && (
        <div className={`rounded-xl p-4 text-sm leading-relaxed ${selected === q.correct_answer ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {selected !== q.correct_answer && (
            <p className="font-semibold mb-1">정답: {q.correct_answer} — {q.options[q.correct_answer]}</p>
          )}
          <p>{q.explanation}</p>
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
