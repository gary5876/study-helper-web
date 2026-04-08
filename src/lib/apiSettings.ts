export type Plan = 'timely' | 'paid' | 'gpt'

const PLAN_KEY = 'sh_plan'
const API_KEY_KEY = 'sh_api_key'
const MODEL_KEY = 'sh_model'

export const PLAN_MODELS: Record<Plan, string[]> = {
  timely: [
    // 추천
    'auto',
    'gpt-5.4-mini',
    'gemini-3.1-flash-lite',
    'claude-haiku-4-5-20251001',
    'llama-4-scout-17b',
    'mistral-small',
    'solar-pro3',
    'grok-4.1-fast-reasoning',
    // OpenAI
    'gpt-5.4-nano', 'gpt-5.4', 'gpt-5.3-chat', 'gpt-5.2', 'gpt-5.2-chat',
    'gpt-5.1', 'gpt-5.1-chat', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano',
    'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'gpt-4o-mini', 'o4-mini', 'o3',
    // Gemini
    'gemini-3-flash', 'gemini-3.1-pro',
    'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash',
    // Claude
    'claude-sonnet-4-6', 'claude-sonnet-4-5', 'claude-opus-4-6',
    // Mistral
    'mistral-medium', 'mistral-large', 'magistral-medium', 'magistral-small',
    'devstral-medium', 'codestral',
    // Grok
    'grok-4.1-fast-non-reasoning', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning',
    'grok-4', 'grok-3', 'grok-3-mini', 'grok-code-fast',
    // Upstage
    'solar-pro2',
    // Qwen
    'qwen-qwq-32b',
  ],
  paid:   ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-sonnet-4-5', 'claude-haiku-4-5-20251001'],
  gpt:    ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1', 'o4-mini', 'o3'],
}

export const DEFAULT_MODELS: Record<Plan, string> = {
  timely: 'auto',
  paid:   'claude-sonnet-4-6',
  gpt:    'gpt-4o-mini',
}

export function getPlan(): Plan | null {
  if (typeof window === 'undefined') return null
  return (localStorage.getItem(PLAN_KEY) as Plan) ?? null
}

export function savePlan(plan: Plan) {
  localStorage.setItem(PLAN_KEY, plan)
}

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(API_KEY_KEY)
}

export function saveApiKey(key: string) {
  localStorage.setItem(API_KEY_KEY, key)
}

export function getModel(plan: Plan): string {
  if (typeof window === 'undefined') return DEFAULT_MODELS[plan]
  return localStorage.getItem(`${MODEL_KEY}_${plan}`) ?? DEFAULT_MODELS[plan]
}

export function saveModel(plan: Plan, model: string) {
  localStorage.setItem(`${MODEL_KEY}_${plan}`, model)
}

export function clearApiSettings() {
  localStorage.removeItem(PLAN_KEY)
  localStorage.removeItem(API_KEY_KEY)
  Object.keys(DEFAULT_MODELS).forEach(p => localStorage.removeItem(`${MODEL_KEY}_${p}`))
}
