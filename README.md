# Study Helper — Web

Study Helper의 Next.js 웹 프론트엔드.
PDF 업로드·AI 콘텐츠 생성·대시보드·사용자 계정 기능을 제공합니다.

---

## 현재 상태 (2026-04-08)

### 완성된 기능

- [x] **랜딩 페이지** (`/`) — 서비스 소개, 기능 안내, 플랜 안내, CTA (로그인 유도)
- [x] **로그인 페이지** (`/login`) — Supabase Auth 기반 이메일/소셜 로그인
- [x] **업로드 페이지** (`/upload`) — PDF 업로드 → AI 생성 → 진행률 폴링 → 결과 이동
  - ⚠️ **현재 준비 중**: 무료 플랜 키 보충 전까지 "준비 중" 안내 노출
  - 실제 업로드 로직은 `UploadPageFree` 함수로 보존 (재개 시 export default로 교체)
- [x] **대시보드** (`/dashboard`) — 생성된 세션 목록, Supabase 연동 계정 데이터

### 무료 플랜 UI 일시 숨김 (2026-04-08~)

Gemini API 키 풀 보충 전까지 사용자 진입 경로를 차단합니다.

| 위치 | 변경 내용 |
|------|-----------|
| 랜딩 `/` | 무료 플랜 카드 제거, "무료로 시작" CTA → 로그인 페이지로 변경 |
| 업로드 `/upload` | "준비 중" 안내 화면 노출, 실제 로직은 `UploadPageFree()`로 보존 |

**재개 방법**: `upload/page.tsx`에서 `UploadPageFree`를 `export default`로 변경하고, 랜딩 페이지 플랜 카드에 무료 항목 복원.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js (App Router) |
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
├── page.tsx          랜딩 페이지
├── login/page.tsx    로그인
├── upload/page.tsx   PDF 업로드 (현재 준비 중 화면)
└── dashboard/        세션 대시보드
```
