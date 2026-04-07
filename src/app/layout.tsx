import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: '공부 도우미 — PDF로 AI 학습 노트·문제 자동 생성',
  description: 'PDF를 올리면 AI가 핵심 개념 정리, 객관식, 빈칸 채우기 문제를 자동 생성해드립니다. 간격 반복으로 효율적인 복습까지.',
  keywords: ['AI 학습', 'PDF 공부', '자동 문제 생성', '객관식', '복습', '대학 공부'],
  openGraph: {
    title: '공부 도우미 — PDF로 AI 학습 노트 자동 생성',
    description: 'PDF를 올리면 AI가 학습 노트와 문제를 만들어줍니다.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={geist.variable}>
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  )
}
