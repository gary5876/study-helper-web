'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Plan, PLAN_MODELS, DEFAULT_MODELS,
  getPlan, savePlan, getApiKey, saveApiKey, getModel, saveModel,
} from '@/lib/apiSettings'

const SERVICES: { plan: Plan; label: string; keyPlaceholder: string; keyHint: string; validate: (k: string) => boolean; validationMsg: string }[] = [
  {
    plan: 'timely',
    label: 'TimelyGPT',
    keyPlaceholder: 'tgpt-sk-...',
    keyHint: 'timelygpt.co.kr → 설정 → 연동 키 관리',
    validate: (k) => k.length >= 10,
    validationMsg: '키가 너무 짧습니다. 올바른 키인지 확인해 주세요.',
  },
  {
    plan: 'paid',
    label: 'Anthropic Claude',
    keyPlaceholder: 'sk-ant-api03-...',
    keyHint: 'console.anthropic.com에서 발급',
    validate: (k) => k.startsWith('sk-ant-'),
    validationMsg: 'Anthropic 키는 보통 sk-ant- 로 시작합니다.',
  },
  {
    plan: 'gpt',
    label: 'OpenAI GPT',
    keyPlaceholder: 'sk-...',
    keyHint: 'platform.openai.com에서 발급',
    validate: (k) => k.startsWith('sk-'),
    validationMsg: 'OpenAI 키는 보통 sk- 로 시작합니다.',
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  // 계정
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // AI 설정
  const [selectedPlan, setSelectedPlan] = useState<Plan>('timely')
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS['timely'])
  const [apiKey, setApiKey] = useState('')
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [editingKey, setEditingKey] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiSaved, setAiSaved] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setEmail(user.email)
    })()

    ;(() => {
      const plan = getPlan()
      if (plan) {
        setSelectedPlan(plan)
        setSelectedModel(getModel(plan))
        if (getApiKey()) setApiKeySaved(true)
      }
    })()
  }, [supabase.auth])

  const service = SERVICES.find(s => s.plan === selectedPlan)!

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwLoading(true)
    setPwMessage('')

    // 현재 비밀번호로 재인증
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    if (signInError) {
      setPwMessage('현재 비밀번호가 올바르지 않습니다.')
      setPwLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPwMessage(error.message)
    } else {
      setPwMessage('비밀번호가 변경되었습니다.')
      setCurrentPassword('')
      setNewPassword('')
    }
    setPwLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    const { error } = await supabase.rpc('delete_user')
    if (error) {
      alert('회원탈퇴에 실패했습니다. 고객센터에 문의해주세요.')
    } else {
      await supabase.auth.signOut()
      router.push('/')
    }
    setDeleteLoading(false)
  }

  function handleSelectPlan(plan: Plan) {
    setSelectedPlan(plan)
    setSelectedModel(DEFAULT_MODELS[plan])
    setApiKey('')
    setApiKeySaved(false)
    setEditingKey(false)
    setAiError('')
    setAiSaved(false)
  }

  function handleAiSave() {
    if (!apiKeySaved && !apiKey.trim()) {
      setAiError('API 키를 입력해주세요.')
      return
    }
    savePlan(selectedPlan)
    saveModel(selectedPlan, selectedModel)
    if (editingKey || !apiKeySaved) {
      saveApiKey(apiKey.trim())
      setApiKeySaved(true)
      setEditingKey(false)
    }
    setAiError('')
    setAiSaved(true)
    setTimeout(() => setAiSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-600">공부 도우미</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">대시보드</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>

        {/* 계정 정보 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">계정 정보</h2>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">이메일</label>
            <p className="text-sm text-gray-800">{email || '로딩 중...'}</p>
          </div>

          {/* 비밀번호 변경 */}
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <p className="text-xs font-medium text-gray-500">비밀번호 변경</p>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호"
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (6자 이상)"
              required
              minLength={6}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {pwMessage && (
              <p className={`text-xs ${pwMessage.includes('변경되었습니다') ? 'text-green-600' : 'text-red-500'}`}>
                {pwMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={pwLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {pwLoading ? '처리 중...' : '비밀번호 변경'}
            </button>
          </form>

          {/* 로그아웃 / 탈퇴 */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              로그아웃
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-500 text-sm font-medium hover:underline"
            >
              회원탈퇴
            </button>
          </div>

          {/* 탈퇴 확인 */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 rounded-xl space-y-3">
              <p className="text-sm text-red-700 font-medium">정말로 탈퇴하시겠습니까?</p>
              <p className="text-xs text-red-500">모든 학습 데이터가 삭제되며 복구할 수 없습니다.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? '처리 중...' : '탈퇴하기'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </section>

        {/* AI 서비스 설정 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">AI 서비스 설정</h2>

          {/* 서비스 선택 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">서비스</label>
            <div className="space-y-2">
              {SERVICES.map(s => (
                <button
                  key={s.plan}
                  onClick={() => handleSelectPlan(s.plan)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                    selectedPlan === s.plan
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 모델 선택 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">모델</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {PLAN_MODELS[selectedPlan].map(m => (
                <option key={m} value={m}>
                  {m}{m === DEFAULT_MODELS[selectedPlan] ? ' (기본값)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">API Key</label>
            {apiKeySaved && !editingKey ? (
              <div className="flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50">
                <span className="text-gray-600 text-sm tracking-widest">●●●●●●●●●●●●  저장됨</span>
                <button
                  onClick={() => { setEditingKey(true); setApiKey('') }}
                  className="text-indigo-600 text-sm font-medium hover:underline ml-4"
                >
                  변경
                </button>
              </div>
            ) : (
              <input
                type="password"
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setAiError('') }}
                placeholder={service.keyPlaceholder}
                autoComplete="off"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
            {apiKey.trim().length > 0 && !service.validate(apiKey.trim()) && (
              <p className="mt-1 text-xs text-amber-500">⚠ {service.validationMsg}</p>
            )}
            <p className="mt-1.5 text-xs text-gray-500">{service.keyHint}</p>
          </div>

          {aiError && <p className="text-sm text-red-500">{aiError}</p>}

          <button
            onClick={handleAiSave}
            disabled={!apiKeySaved && !apiKey.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40"
          >
            {aiSaved ? '저장됨 ✓' : '저장'}
          </button>
        </section>
      </main>
    </div>
  )
}
