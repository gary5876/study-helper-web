'use client'

export type StudyMode = 'light' | 'exam' | 'max'

interface Props {
  onSelect: (mode: StudyMode) => void
}

const MODES: {
  mode: StudyMode
  title: string
  desc: string
  levelTag: string
  accent: string
  bg: string
}[] = [
  {
    mode: 'light',
    title: '가볍게 공부',
    desc: '기초 개념을 확인하는 부담 없는 문제입니다. 처음 접하는 내용이거나 빠르게 훑을 때 적합합니다.',
    levelTag: 'Lv.1–2',
    accent: 'text-teal-700 border-teal-400',
    bg: 'bg-teal-50 hover:bg-teal-100',
  },
  {
    mode: 'exam',
    title: '시험 대비',
    desc: '실전 시험 수준의 문제입니다. 개념 적용부터 복합 분석까지 골고루 출제됩니다.',
    levelTag: 'Lv.3–5',
    accent: 'text-orange-700 border-orange-400',
    bg: 'bg-orange-50 hover:bg-orange-100',
  },
  {
    mode: 'max',
    title: '최고난도',
    desc: '변별력 있는 최상위 문제만 모았습니다. 비판적 사고와 심화 이해가 필요합니다.',
    levelTag: 'Lv.5',
    accent: 'text-red-700 border-red-400',
    bg: 'bg-red-50 hover:bg-red-100',
  },
]

export default function ModeSelect({ onSelect }: Props) {
  return (
    <div className="max-w-lg mx-auto py-8 px-4 flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">학습 모드를 선택하세요</h2>
        <p className="text-sm text-gray-500">목적에 맞는 난이도로 문제를 풀어보세요.</p>
      </div>
      <div className="flex flex-col gap-4">
        {MODES.map(({ mode, title, desc, levelTag, accent, bg }) => (
          <button
            key={mode}
            onClick={() => onSelect(mode)}
            className={`text-left rounded-2xl border-2 p-5 transition-colors ${accent} ${bg}`}
          >
            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-2 ${accent} border`}>
              {levelTag}
            </span>
            <p className="font-bold text-base mb-1">{title}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
