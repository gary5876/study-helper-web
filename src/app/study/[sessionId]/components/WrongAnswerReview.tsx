'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  computeNextState, INITIAL_SM2_STATE, actionToQuality,
  type ReviewAction, type SM2State,
} from '@/lib/scheduler'
import type { MCQQuestion } from './MCQCard'
import type { FillQuestion } from './FillCard'
import type { KeyConcept } from './StudyNotes'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

interface WrongAnswer {
  questionId: string
  userAnswer: string
  question: MCQQuestion | FillQuestion
  type: 'mcq' | 'fill'
}

interface Props {
  wrongAnswers: WrongAnswer[]
  sessionId: string
  concepts: KeyConcept[]
  onDone: () => void
  onRetryConfused: (ids: string[]) => void
  onViewConcept: (concept: KeyConcept) => void
}

const ACTION_CONFIG: { action: ReviewAction; label: string; color: string; selectedBg: string }[] = [
  { action: 'got_it', label: '알겠어요 ✓', color: 'text-green-700', selectedBg: 'bg-green-500 text-white' },
  { action: 'got_it_with_hint', label: '힌트 필요', color: 'text-orange-700', selectedBg: 'bg-orange-500 text-white' },
  { action: 'still_confused', label: '아직 헷갈려요', color: 'text-red-700', selectedBg: 'bg-red-500 text-white' },
]

function getQuestionText(q: MCQQuestion | FillQuestion): string {
  if ('options' in q) return q.question
  return q.sentence_with_blank
}

function getCorrectAnswer(q: MCQQuestion | FillQuestion): string {
  if ('options' in q) {
    const key = q.correct_answer as 'A' | 'B' | 'C' | 'D'
    return `${key}: ${q.options[key]}`
  }
  return q.answer
}

function getExplanation(q: MCQQuestion | FillQuestion): string {
  if ('explanation' in q) return q.explanation
  return ''
}

export default function WrongAnswerReview({
  wrongAnswers, sessionId, concepts, onDone, onRetryConfused, onViewConcept,
}: Props) {
  const [actions, setActions] = useState<Record<string, ReviewAction>>({})
  const [saving, setSaving] = useState(false)

  function setAction(questionId: string, action: ReviewAction) {
    setActions(prev => ({ ...prev, [questionId]: action }))
  }

  const allReviewed = wrongAnswers.every(wa => actions[wa.questionId])

  async function handleDone() {
    setSaving(true)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    for (const wa of wrongAnswers) {
      const action = actions[wa.questionId]
      if (!action) continue

      const quality = actionToQuality(action)
      const nextState = computeNextState(INITIAL_SM2_STATE, quality)

      if (token) {
        try {
          await fetch(`${BACKEND_URL}/user/review-schedule`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              session_id: sessionId,
              question_id: wa.questionId,
              question_type: wa.type,
              interval_days: nextState.interval,
              next_review_at: new Date(Date.now() + nextState.interval * 86400000).toISOString(),
              ease_factor: nextState.easeFactor,
              repetitions: nextState.repetitions,
              status: 'pending',
            }),
          })
        } catch {
          console.error(`Failed to save review for ${wa.questionId}`)
        }
      }
    }

    const confusedIds = wrongAnswers
      .filter(wa => actions[wa.questionId] === 'still_confused')
      .map(wa => wa.questionId)

    setSaving(false)

    if (confusedIds.length > 0) {
      onRetryConfused(confusedIds)
    } else {
      onDone()
    }
  }

  if (wrongAnswers.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <p className="text-xl font-bold text-gray-800 mb-4">오답이 없어요 — 훌륭합니다!</p>
        <button
          onClick={onDone}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
        >
          홈으로
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 flex flex-col gap-4">
      <p className="text-sm text-gray-500">각 오답을 복습하고 현재 이해도를 표시해주세요.</p>

      {wrongAnswers.map(wa => {
        const concept = concepts.find(c => c.id === wa.question.concept_id)
        const explanation = getExplanation(wa.question)

        return (
          <div key={wa.questionId} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
            <p className="text-gray-800 leading-relaxed">{getQuestionText(wa.question)}</p>

            <div className="border-t border-gray-50 pt-3 space-y-2">
              <div>
                <span className="text-xs font-semibold text-red-600">내 답변: </span>
                <span className="text-sm text-red-600">{wa.userAnswer}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-green-700">정답: </span>
                <span className="text-sm text-green-700">{getCorrectAnswer(wa.question)}</span>
              </div>
              {explanation && (
                <div>
                  <span className="text-xs font-semibold text-gray-500">설명: </span>
                  <span className="text-sm text-gray-600">{explanation}</span>
                </div>
              )}
            </div>

            {concept && (
              <button
                onClick={() => onViewConcept(concept)}
                className="text-xs text-indigo-600 hover:underline"
              >
                관련 개념 보기
              </button>
            )}

            <div className="border-t border-gray-50 pt-3">
              <p className="text-xs text-gray-500 mb-2">지금 이해도는?</p>
              <div className="flex gap-2 flex-wrap">
                {ACTION_CONFIG.map(({ action, label, color, selectedBg }) => {
                  const selected = actions[wa.questionId] === action
                  return (
                    <button
                      key={action}
                      onClick={() => setAction(wa.questionId, action)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selected
                          ? selectedBg
                          : `bg-gray-50 ${color} border border-gray-200 hover:bg-gray-100`
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      <div className="sticky bottom-0 bg-gray-50/95 border-t border-gray-100 py-4 -mx-4 px-4">
        <button
          onClick={handleDone}
          disabled={!allReviewed || saving}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving
            ? '저장 중...'
            : wrongAnswers.some(wa => actions[wa.questionId] === 'still_confused')
              ? '헷갈리는 문제 재시도'
              : '완료!'
          }
        </button>
      </div>
    </div>
  )
}

export type { WrongAnswer }
