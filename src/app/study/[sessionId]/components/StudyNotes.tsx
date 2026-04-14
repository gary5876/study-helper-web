'use client'

import { useState } from 'react'

export interface KeyConcept {
  id: string
  term: string
  definition: string
  importance: 'high' | 'medium' | 'low'
}

export interface StudySection {
  title: string
  summary: string
  bullets: string[]
}

export interface GlossaryEntry {
  term: string
  brief_def: string
}

export interface StudyNotesData {
  key_concepts: KeyConcept[]
  sections: StudySection[]
  glossary: GlossaryEntry[]
}

interface Props {
  notes: StudyNotesData
  onStartQuiz: () => void
}

const IMPORTANCE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  medium: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  low:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
}

const IMPORTANCE_LABEL: Record<string, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
}

export default function StudyNotes({ notes, onStartQuiz }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [selectedConcept, setSelectedConcept] = useState<KeyConcept | null>(null)

  function toggleSection(index: number) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 flex flex-col gap-8 text-gray-900">
      {/* Key Concepts */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">핵심 개념</h2>
        <div className="flex flex-wrap gap-2">
          {notes.key_concepts.map(concept => {
            const color = IMPORTANCE_COLOR[concept.importance] ?? IMPORTANCE_COLOR.low
            return (
              <button
                key={concept.id}
                onClick={() => setSelectedConcept(selectedConcept?.id === concept.id ? null : concept)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${color.bg} ${color.text} ${color.border} hover:opacity-80`}
              >
                {concept.term}
              </button>
            )
          })}
        </div>

        {/* Concept Detail */}
        {selectedConcept && (
          <div className="mt-3 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">{selectedConcept.term}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                IMPORTANCE_COLOR[selectedConcept.importance]?.bg
              } ${IMPORTANCE_COLOR[selectedConcept.importance]?.text}`}>
                {IMPORTANCE_LABEL[selectedConcept.importance]} 중요도
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{selectedConcept.definition}</p>
            <button
              onClick={() => setSelectedConcept(null)}
              className="text-xs text-gray-600 mt-2 hover:text-gray-800"
            >
              닫기
            </button>
          </div>
        )}
      </section>

      {/* Sections / Summaries */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">요약</h2>
        <div className="flex flex-col gap-3">
          {notes.sections.map((sec, i) => {
            const isOpen = expandedSections.has(i)
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleSection(i)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{sec.title}</span>
                  <span className="text-gray-600 text-sm">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <p className="text-sm text-gray-600 mt-3 mb-2 leading-relaxed">{sec.summary}</p>
                    {sec.bullets.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1">
                        {sec.bullets.map((b, j) => (
                          <li key={j} className="text-sm text-gray-600">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Glossary */}
      {notes.glossary.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">용어집</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {notes.glossary.map((entry, i) => (
              <div key={i} className="px-4 py-3">
                <span className="font-medium text-gray-900">{entry.term}</span>
                <span className="text-gray-400 mx-2">—</span>
                <span className="text-sm text-gray-600">{entry.brief_def}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Start Quiz Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onStartQuiz}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          테스트 시작
        </button>
      </div>
    </div>
  )
}
