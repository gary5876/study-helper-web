# Study Helper — Web

Study Helper의 Next.js 웹 프론트엔드.
PDF 업로드·AI 콘텐츠 생성·대시보드·학습 퀴즈 기능을 제공합니다.

---

## 현재 상태 (2026-05-03)

> **2026-05-03** — `develop` 브랜치 Render 배포를 **Docker runtime** 으로 전환.
> Native Node 빌드(`npm ci; npm run build`) → 루트 `Dockerfile` 기반 빌드로 통일
> (AWS main 배포와 동일 이미지 경로). `render.yaml` 신규 — `runtime: docker`,
> `dockerfilePath: ./Dockerfile`, `healthCheckPath: /healthz`. 빌드 타임 inline 용
> `NEXT_PUBLIC_*` 3종은 Render envVars 가 아닌 **Dashboard → Settings → Build →
> Docker Build Arguments** 에 등록해야 함 (Render envVars 는 런타임 전용).
> `PORT` 는 Render 자동 주입을 그대로 사용.

> **2026-05-02** — `develop` 브랜치 Render 배포 준비. `src/app/healthz/route.ts`
> 신규 — Render Health Check Path `/healthz`에 응답하는 정적 라우트(GET/HEAD,
> `text/plain "ok"`). Render 환경변수에는 빌드 타임 inline용 `NEXT_PUBLIC_*` 3종
> (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
> `NEXT_PUBLIC_BACKEND_URL`) 등록 필요. `PORT`는 Render가 자동 주입하므로
> 직접 설정하지 않음. Build Command는 `npm ci; npm run build` 권장.

> **2026-04-30** — `chore/coderabbit-config` 브랜치에서 CodeRabbit 자동 코드
> 리뷰 설정 도입. `.coderabbit.yaml` (한국어 리뷰, `src/app`·`src/lib`·
> `src/proxy.ts`·`next.config.ts` 별 path 지침). 핵심 가드: `"use client"`
> 위치 검토, 캐시 정책, Authorization 헤더 일관성, NEXT_PUBLIC_* 누설 차단,
> 오픈 리다이렉트 화이트리스트. 상세:
> `../documents/record_progress/2026-04-30-01-coderabbit-도입.md`.

### 2026-04-14 완성 기능

- [x] **랜딩 페이지** (`/`) — 서비스 소개, 기능 안내, 플랜 안내, CTA (로그인 유도)
- [x] **로그인 페이지** (`/login`) — Supabase Auth 기반 이메일/소셜 로그인
- [x] **업로드 페이지** (`/upload`) — PDF 업로드 → AI 생성 → 진행률 폴링 → 결과 이동
- [x] **대시보드** (`/dashboard`) — 생성된 세션 목록, Supabase 연동 계정 데이터, 과목별 탭 바(전체/미분류/과목별), 과목 생성·삭제
- [x] **학습 페이지** (`/study/[sessionId]`) — 모드 선택 → MCQ → 빈칸 채우기 → 결과 전체 플로우
  - **모드 선택**: 가볍게(Lv.1–2) / 시험 대비(Lv.3–5) / 최고난도(Lv.5) 중 선택
  - **MCQ 카드**: Lv.N 5단계 색상 배지 + 개념/실습 유형 배지, 정답·오답 피드백
  - **빈칸 카드**: Lv.N + 유형 배지, fuzzy 정답 체크(Levenshtein), 힌트
  - **결과 화면**: 점수·학점·모드 표시, 다시 풀기
  - **학습 노트**: 핵심 개념 칩(중요도 색상) · 섹션 접기/펼치기 · 용어집
  - **오답 복습 + 개념 복습**: SM-2 백엔드 연동, 이해도 3단계 평가, 개념 상세 보기
- [x] "학습하기" 링크 → `/study/[sessionId]` 정상 연결 (기존 `/upload?session=` 버그 수정)
- [x] **다국어(한/영) 지원** — `LangProvider` + `useLang()` hook, 언어 토글 버튼

### 2026-04-14 변경

- [x] **보안 헤더 / 오픈 리다이렉트 차단** (`next.config.ts`에 HSTS·X-Frame-Options·Permissions-Policy, `/auth/callback`의 `next` 파라미터 상대 경로 한정)
- [x] **로그인 에러 메시지 친화화** — Supabase 내부 에러 원문 대신 한국어 매핑 메시지
- [x] **`/status`·`/result` Authorization 헤더 보완** — 세션 소유권 검증 추가에 따른 403 회귀 수정, Supabase 세션에서 access_token 추출해 헤더 부착
- [x] **저대비 텍스트 & 다크 모드 가독성 개선** — `text-gray-400` 대부분을 `gray-500~600`으로 상향, `globals.css` `.dark` body 변수 오버라이드 제거, `theme.tsx`에서 `.dark` 클래스 적용 중단(다크 모드 반쪽 구현 잠정 해체), 학습/문제 카드 루트에 `text-gray-900` 명시로 body 색 상속 차단
- [x] **대시보드 세션 상태 3초 폴링** — `SessionList.tsx`가 pending/processing 세션이 있는 동안 `/user/sessions`를 3초 간격으로 재조회, 모두 종결되면 자동 중단. `READY_STATUSES = {ready, complete}` 둘 다 "학습하기" 링크 노출
- [x] **백엔드 세션 ID 단일화 연동** — 백엔드 `/upload`가 `user_sessions` 행을 upsert하고 `/generate` 완료 시 `ready` 상태로 동기화하므로, 대시보드가 정상적으로 `pending → ready` 전환을 보여주고 `/study/${s.id}` 라우트도 메모리 store와 일치하는 id로 라우팅
- [x] **"오늘 복습" 배너** — `dashboard/DueReviews.tsx`가 `/user/review-schedule` + `/user/sessions`를 병렬 조회해 due 항목을 세션별로 group-by 후 대시보드 상단에 카드로 렌더, 세션별 "복습하기" 링크 제공
- [x] **업로드 동의 모달** — `/upload` 페이지 최초 진입 시 PDF 외부 전송·문제은행 공유·API 키 처리·저작권 준수 4항목 고지를 1회 표시, `localStorage['sh_upload_consent_v1']`로 동의 상태 저장 (모바일 UploadScreen과 동일 카피)
- [x] **세션 삭제 UI** — `SessionList` 각 카드에 🗑 버튼, 확인 후 `DELETE /user/sessions/{id}` 호출로 서버 + 로컬 state 동시 제거
- [x] **상태 라벨 정리** — `STATUS_LABEL`/`STATUS_COLOR`에서 도달 불가능한 `processing`·`complete` 제거하고 `pending/ready/failed` 3종으로 축소, `READY_STATUSES = {ready}` 단일화

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
| 배포 | `main` → AWS (ECR + EC2, Docker) · `develop` → Render (Docker) |

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
├── healthz/route.ts      Render 헬스체크 (GET/HEAD → 200 "ok")
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
