'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [agreed, setAgreed] = useState(false)

  const supabase = createClient()

  function friendlyError(err: { message: string }): string {
    const msg = err.message.toLowerCase()
    if (msg.includes('invalid login')) return '이메일 또는 비밀번호가 올바르지 않습니다.'
    if (msg.includes('email not confirmed')) return '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요.'
    if (msg.includes('rate limit')) return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    if (msg.includes('already registered')) return '이미 등록된 이메일입니다.'
    return '처리에 실패했습니다. 다시 시도해주세요.'
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(friendlyError(error))
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      if (!agreed) {
        setMessage('약관에 동의해 주세요.')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: { terms_accepted_at: new Date().toISOString() },
        },
      })
      if (error) {
        setMessage(friendlyError(error))
      } else {
        setMessage('확인 이메일을 발송했습니다. 받은 편지함을 확인해주세요.')
      }
    }
    setLoading(false)
  }

  async function handleGoogle() {
    if (mode === 'signup' && !agreed) {
      setMessage('약관에 동의해 주세요.')
      return
    }
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            공부 도우미
          </Link>
          <p className="mt-2 text-gray-500 text-sm">
            {mode === 'login' ? '계정에 로그인하세요' : '새 계정을 만드세요'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              로그인에 실패했습니다. 다시 시도해주세요.
            </div>
          )}

          {mode === 'signup' && (
            <div className="mb-4">
              <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  가입하면 생성된 학습 자료가 서비스 품질 개선에 활용될 수 있음에 동의합니다.{' '}
                  <details className="inline">
                    <summary className="inline cursor-pointer text-indigo-600 hover:underline">자세히</summary>
                    <span className="block mt-1 text-gray-500">
                      동일한 PDF로 생성된 학습 자료(문제·노트)는 공용 저장소에 보관되어, 같은 파일을 업로드한 다른 사용자에게 재사용될 수 있습니다. 자세한 내용은{' '}
                      <Link href="/privacy" className="text-indigo-600 hover:underline">개인정보처리방침</Link>을 참고해 주세요.
                    </span>
                  </details>
                </span>
              </label>
            </div>
          )}

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={loading || (mode === 'signup' && !agreed)}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 {mode === 'login' ? '로그인' : '가입'}
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-500">또는</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Email/Password */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="6자 이상"
              />
            </div>

            {message && (
              <p className={`text-sm ${message.includes('발송') ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'signup' && !agreed)}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {mode === 'login' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
            <button
              onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setMessage(''); setAgreed(false) }}
              className="text-indigo-600 font-medium hover:underline"
            >
              {mode === 'login' ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
