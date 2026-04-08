import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '개인정보처리방침 — 공부 도우미',
  description: '공부 도우미 서비스의 개인정보처리방침입니다.',
}

const EFFECTIVE_DATE = '2026년 4월 8일'
const SERVICE_NAME = '공부 도우미 (Study Helper)'

export default function PrivacyPage() {
  return (
    <div className="font-[family-name:var(--font-geist)]">
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-600">공부 도우미</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 pt-28 pb-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-gray-500 mb-10">시행일: {EFFECTIVE_DATE}</p>

        <Section title="1. 총칙">
          <p>
            {SERVICE_NAME}(이하 &quot;서비스&quot;)는 사용자의 개인정보를 소중히 여기며,
            「개인정보 보호법」 및 관련 법령을 준수합니다.
            본 방침은 서비스가 어떤 정보를 수집·이용·보관·파기하는지 설명합니다.
          </p>
        </Section>

        <Section title="2. 수집하는 정보">
          <Table
            headers={['항목', '수집 방법', '목적']}
            rows={[
              ['이메일 주소', '회원가입 / 소셜 로그인', '계정 식별 및 로그인'],
              ['IP 주소', '서버 자동 수집', '어뷰징 방지(Rate Limiting)'],
              ['업로드 PDF 텍스트', '사용자 직접 제공', 'AI 학습 자료 생성'],
              ['API 키 (선택)', '사용자 직접 입력 (기기 저장)', 'AI 서비스 호출'],
              ['학습 기록', '앱 내 자동 생성', '간격 반복 복습 스케줄 관리'],
            ]}
          />
          <Note>
            API 키는 기기의 SecureStore에만 저장되며, 서버는 요청 처리 후 즉시 파기합니다.
            서버 로그에 API 키가 기록되지 않도록 마스킹 처리합니다.
          </Note>
        </Section>

        <Section title="3. 개인정보의 이용 목적">
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>서비스 제공 및 AI 학습 자료 생성</li>
            <li>비정상적인 접근 탐지 및 서비스 안정성 유지</li>
            <li>서비스 개선을 위한 익명 통계 분석</li>
          </ul>
        </Section>

        <Section title="4. 제3자 제공">
          <p>
            업로드된 PDF 텍스트는 사용자가 선택한 AI 서비스(Anthropic, OpenAI, TimelyGPT)의
            서버로 전송되어 학습 자료 생성에 사용됩니다. 각 서비스의 개인정보처리방침이 적용됩니다.
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-gray-700">
            <li>
              Anthropic:{' '}
              <a href="https://www.anthropic.com/privacy" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">
                anthropic.com/privacy
              </a>
            </li>
            <li>
              OpenAI:{' '}
              <a href="https://openai.com/policies/privacy-policy" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">
                openai.com/policies/privacy-policy
              </a>
            </li>
            <li>
              TimelyGPT:{' '}
              <a href="https://timelygpt.co.kr" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">
                timelygpt.co.kr
              </a>
            </li>
          </ul>
          <Note>위 목적 외 제3자 제공은 하지 않습니다.</Note>
        </Section>

        <Section title="5. 보유 및 파기">
          <Table
            headers={['정보', '보유 기간', '파기 방법']}
            rows={[
              ['계정 정보', '탈퇴 요청 시 즉시', 'DB 영구 삭제'],
              ['PDF 텍스트 (세션)', '생성 완료 후 2시간', 'Redis TTL 자동 만료'],
              ['생성된 문제 (문제은행)', '서비스 운영 기간', '서비스 종료 시 삭제'],
              ['서버 로그 (IP 포함)', '최대 30일', '자동 롤오버 삭제'],
            ]}
          />
        </Section>

        <Section title="6. 사용자 권리">
          <p>
            사용자는 언제든지 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다.
            계정 탈퇴는 앱 내 설정에서 가능하며, 탈퇴 시 개인정보는 즉시 파기됩니다.
            문의는 아래 연락처로 접수해 주세요.
          </p>
        </Section>

        <Section title="7. 보안 조치">
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>API 키: 기기 내 암호화 저장 (Expo SecureStore), 서버 비저장</li>
            <li>통신: HTTPS 암호화</li>
            <li>접근 제어: IP당 분당 30회 Rate Limiting</li>
            <li>로그: API 키 등 민감 정보 마스킹 처리</li>
          </ul>
        </Section>

        <Section title="8. 쿠키 및 추적">
          <p>
            서비스는 로그인 세션 유지를 위해 Supabase 인증 쿠키를 사용합니다.
            별도의 광고 추적 쿠키는 사용하지 않습니다.
          </p>
        </Section>

        <Section title="9. 방침 변경">
          <p>
            본 방침이 변경될 경우 시행 7일 전에 앱 공지 또는 이 페이지를 통해 안내합니다.
          </p>
        </Section>

        <Section title="10. 문의">
          <p>
            개인정보 관련 문의사항은{' '}
            <a href="https://github.com/gary5876/study-helper-backend/issues" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">
              GitHub Issues
            </a>
            를 통해 접수해 주세요.
          </p>
        </Section>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="text-gray-700 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800">
      {children}
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mt-2">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 border border-gray-200">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="even:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 border border-gray-200 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
