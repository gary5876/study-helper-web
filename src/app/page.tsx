import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '공부 도우미 — PDF로 AI 학습 노트·문제 자동 생성',
  description: 'PDF를 올리면 AI가 핵심 개념 정리, 객관식, 빈칸 채우기 문제를 자동 생성해드립니다. 간격 반복으로 효율적인 복습까지.',
}

const features = [
  { icon: '📝', title: '핵심 개념 정리', desc: 'AI가 PDF에서 핵심 개념과 요약을 자동으로 추출합니다' },
  { icon: '✏️', title: '객관식 문제', desc: '내용 기반 4지선다 문제를 자동 생성합니다' },
  { icon: '🔲', title: '빈칸 채우기', desc: '핵심 키워드를 빈칸으로 만들어 능동적 복습을 도와줍니다' },
  { icon: '🔄', title: '간격 반복', desc: 'SM-2 알고리즘으로 최적의 복습 일정을 관리합니다' },
]

const steps = [
  { num: '01', title: 'PDF 업로드', desc: '강의 자료나 교재 PDF를 올립니다' },
  { num: '02', title: 'AI 생성', desc: 'AI가 30초~2분 안에 학습 자료를 만들어줍니다' },
  { num: '03', title: '퀴즈 풀기', desc: '노트 확인 → 객관식 → 빈칸 순서로 복습합니다' },
]

const plans = [
  {
    name: '무료',
    price: '₩0',
    desc: 'Gemini AI 사용',
    features: ['PDF 업로드 무제한', 'AI 학습 노트 생성', '객관식 · 빈칸 문제', '간격 반복 복습'],
    cta: '무료로 시작',
    href: '/upload',
    highlight: false,
  },
  {
    name: 'API 키',
    price: '내 키 사용',
    desc: 'Claude / GPT / TimelyGPT',
    features: ['무료 플랜 모든 기능', '더 높은 품질의 생성', 'Claude · GPT · TimelyGPT 선택', '빠른 처리 속도'],
    cta: '내 API 키로 시작',
    href: '/upload',
    highlight: true,
  },
]

export default function LandingPage() {
  return (
    <div className="font-[family-name:var(--font-geist)]">
      {/* 네비게이션 */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">공부 도우미</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              로그인
            </Link>
            <Link
              href="/upload"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              무료로 시작
            </Link>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium mb-6">
            AI 기반 학습 도우미
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            PDF 하나로<br />
            <span className="text-indigo-600">완벽한 학습 자료</span> 완성
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            강의 자료나 교재를 올리면 AI가 핵심 개념 정리, 객관식, 빈칸 채우기 문제를 자동으로 만들어드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/upload"
              className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              지금 무료로 시작하기 →
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              로그인
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">신용카드 불필요 · 회원가입 없이도 사용 가능</p>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">학습에 필요한 모든 것</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 사용법 */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">3단계로 시작하세요</h2>
          <div className="space-y-6">
            {steps.map(s => (
              <div key={s.num} className="flex items-start gap-6 bg-white rounded-2xl p-6 shadow-sm">
                <span className="text-3xl font-bold text-indigo-100 shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 플랜 */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">플랜 선택</h2>
          <p className="text-center text-gray-500 mb-12">모든 기능을 무료로 사용할 수 있습니다</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {plans.map(p => (
              <div
                key={p.name}
                className={`rounded-2xl p-8 ${p.highlight ? 'bg-indigo-600 text-white' : 'border border-gray-200'}`}
              >
                <p className={`text-sm font-medium mb-1 ${p.highlight ? 'text-indigo-200' : 'text-gray-500'}`}>{p.name}</p>
                <p className={`text-3xl font-bold mb-1 ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.price}</p>
                <p className={`text-sm mb-6 ${p.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{p.desc}</p>
                <ul className="space-y-2 mb-8">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${p.highlight ? 'text-indigo-100' : 'text-gray-600'}`}>
                      <span>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    p.highlight
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-indigo-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작해보세요</h2>
          <p className="text-indigo-200 mb-8">회원가입 없이도 바로 사용할 수 있습니다</p>
          <Link
            href="/upload"
            className="inline-block px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors"
          >
            PDF 업로드하기 →
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center text-sm text-gray-400">
        <p>© 2026 공부 도우미</p>
      </footer>
    </div>
  )
}
