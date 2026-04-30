'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plan, PLAN_MODELS, DEFAULT_MODELS,
  getPlan, savePlan, getApiKey, saveApiKey, getModel, saveModel,
} from '@/lib/apiSettings'

interface ServiceOption {
  plan: Plan
  label: string
  keyPlaceholder: string
  keyHint: string
  validate: (k: string) => boolean
  validationMsg: string
}

const SERVICES: ServiceOption[] = [
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

export default function SetupPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<Plan>('timely')
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS['timely'])
  const [apiKey, setApiKey] = useState('')
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [editingKey, setEditingKey] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    ;(() => {
      const plan = getPlan()
      if (plan) {
        setIsEditing(true)
        setSelectedPlan(plan)
        setSelectedModel(getModel(plan))
        if (getApiKey()) setApiKeySaved(true)
      }
    })()
  }, [])

  const service = SERVICES.find(s => s.plan === selectedPlan)!
  const models = PLAN_MODELS[selectedPlan]

  function handleSelectPlan(plan: Plan) {
    setSelectedPlan(plan)
    setSelectedModel(DEFAULT_MODELS[plan])
    setApiKey('')
    setApiKeySaved(false)
    setEditingKey(false)
    setError('')
  }

  function handleSave() {
    if (!apiKeySaved && !apiKey.trim()) {
      setError('API 키를 입력해주세요.')
      return
    }
    savePlan(selectedPlan)
    saveModel(selectedPlan, selectedModel)
    if (editingKey || !apiKeySaved) {
      saveApiKey(apiKey.trim())
    }
    router.push('/dashboard')
  }

  const canSave = apiKeySaved || apiKey.trim().length > 0

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-indigo-600">공부 도우미</Link>
          <p className="mt-2 text-gray-500 text-sm">AI 서비스를 설정하세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">

          {/* 서비스 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">서비스</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">모델</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {models.map(m => (
                <option key={m} value={m}>
                  {m}{m === DEFAULT_MODELS[selectedPlan] ? ' (기본값)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
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
                onChange={e => { setApiKey(e.target.value); setError('') }}
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

          {/* TimelyGPT 가이드 */}
          {selectedPlan === 'timely' && (
            <div className="bg-indigo-50 rounded-xl p-4 text-sm">
              <p className="font-medium text-indigo-700 mb-2">키 발급 방법</p>
              <ol className="space-y-1 text-indigo-600 text-xs">
                <li>① TimelyGPT 앱 → 설정 탭</li>
                <li>② 연동 키 관리 → 재발급</li>
                <li>③ 복사 후 위에 붙여넣기</li>
              </ol>
              <p className="mt-2 text-xs text-indigo-500">콘텐츠 생성 시 본인 계정 크레딧이 사용됩니다.</p>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40"
          >
            {isEditing ? '저장' : '시작하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
