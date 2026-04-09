# Study Helper — Web

Study Helper의 Next.js 웹 프론트엔드.
PDF 업로드·AI 콘텐츠 생성·대시보드·학습 퀴즈 기능을 제공합니다.

---

## 현재 상태 (2026-04-09)

### 완성된 기능

- [x] **랜딩 페이지** (`/`) — 서비스 소개, 기능 안내, 플랜 안내, CTA (로그인 유도)
- [x] **로그인 페이지** (`/login`) — Supabase Auth 기반 이메일/소셜 로그인
- [x] **업로드 페이지** (`/upload`) — PDF 업로드 → AI 생성 → 진행률 폴링 → 결과 이동
- [x] **대시보드** (`/dashboard`) — 생성된 세션 목록, Supabase 연동 계정 데이터
- [x] **학습 페이지** (`/study/[sessionId]`) — 모드 선택 → MCQ → 빈칸 채우기 → 결과 전체 플로우
  - **모드 선택**: 가볍게(Lv.1–2) / 시험 대비(Lv.3–5) / 최고난도(Lv.5) 중 선택
  - **MCQ 카드**: Lv.N 5단계 색상 배지 + 개념/실습 유형 배지, 정답·오답 피드백
  - **빈칸 카드**: Lv.N + 유형 배지, fuzzy 정답 체크(Levenshtein), 힌트
  - **결과 화면**: 점수·학점·모드 표시, 다시 풀기
- [x] "학습하기" 링크 → `/study/[sessionId]` 정상 연결 (기존 `/upload?session=` 버그 수정)

### 무료 플랜 UI 일시 숨김

Gemini API 키 풀 보충 전까지 사용자 진입 경로를 차단합니다.

**재개 방법**: `upload/page.tsx`에서 `UploadPageFree`를 `export default`로 변경하고, 랜딩 페이지 플랜 카드에 무료 항목 복원.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 인증 | Supabase Auth |
| 배포 | Railway (예정) |

---

## 환경변수 (`.env.local`)

```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

---

## 디렉터리 구조

```
src/app/
├── page.tsx              랜딩 페이지
├── login/page.tsx        로그인
├── upload/page.tsx       PDF 업로드
├── dashboard/            세션 대시보드
│   ├── page.tsx
│   └── SessionList.tsx
└── study/[sessionId]/    학습 퀴즈 페이지
    ├── page.tsx          메인 플로우 오케스트레이터
    └── components/
        ├── ModeSelect.tsx    모드 선택 카드
        ├── MCQCard.tsx       4지선다 + 레벨·유형 배지
        ├── FillCard.tsx      빈칸 채우기 + 레벨·유형 배지
        └── ScoreSummary.tsx  결과 화면
```
