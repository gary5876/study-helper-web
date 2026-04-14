'use client'

import Link from 'next/link'
import type { StudyMode } from './ModeSelect'

interface Props {
  correct: number
  total: number
  mode: StudyMode
  sessionId: string
  onRetry: () => void
  hasWrongAnswers?: boolean
  onReviewWrong?: () => void
}

const MODE_LABEL: Record<StudyMode, string> = {
  light: '가볍게 공부',
  exam: '시험 대비',
  max: '최고난도',
}

function scoreToGrade(pct: number): string {
  if (pct >= 93) return 'A'
  if (pct >= 90) return 'A-'
  if (pct >= 87) return 'B+'
  if (pct >= 83) return 'B'
  if (pct >= 80) return 'B-'
  if (pct >= 77) return 'C+'
  if (pct >= 73) return 'C'
  if (pct >= 70) return 'C-'
  if (pct >= 67) return 'D+'
  if (pct >= 60) return 'D'
  return 'F'
}

export default function ScoreSummary({ correct, total, mode, sessionId, onRetry, hasWrongAnswers, onReviewWrong }: Props) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const grade = scoreToGrade(pct)
  const gradeColor = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-orange-500' : 'text-red-600'
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-orange-400' : 'bg-red-500'

  return (
    <div className="max-w-lg mx-auto py-10 px-4 flex flex-col gap-6 items-center text-center">
      <div className="bg-white text-gray-900 rounded-2xl border border-gray-100 shadow-sm p-8 w-full flex flex-col items-center gap-4">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {MODE_LABEL[mode]} 결과
        </p>
        <p className={`text-6xl font-bold ${gradeColor}`}>{grade}</p>
        <p className="text-3xl font-semibold text-gray-800">{pct}%</p>
        <p className="text-sm text-gray-500">{correct} / {total} 정답</p>

        <div className="w-full bg-gray-100 rounded-full h-3 mt-2">
          <div
            className={`h-3 rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {hasWrongAnswers && onReviewWrong && (
          <button
            onClick={onReviewWrong}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
          >
            오답 복습
          </button>
        )}
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-xl border-2 border-indigo-500 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
        >
          다시 풀기
        </button>
        <Link
          href="/dashboard"
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors text-center"
        >
          대시보드로
        </Link>
      </div>
    </div>
  )
}
