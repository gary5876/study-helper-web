# 변경 요약

<!-- 무엇을 왜 바꿨는지 1~3줄로 -->

## 관련 이슈

<!-- closes #123, refs #456 / 없으면 "없음" -->

## 변경 유형

- [ ] feat — 새 기능
- [ ] fix — 버그 수정
- [ ] security — 보안 수정
- [ ] refactor — 동작 변경 없는 리팩터
- [ ] perf — 성능 개선
- [ ] docs — 문서만
- [ ] test — 테스트만
- [ ] chore — 설정·의존성·CI

## 테스트

- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] 로컬 `npm run dev`에서 동작 확인
- [ ] 다크/라이트 테마 양쪽 확인 (해당 시)

## 체크리스트

- [ ] 서버/클라이언트 컴포넌트 경계 (`"use client"`) 검토 완료
- [ ] 데이터 페칭 캐시 정책 명시 (no-store / force-cache / revalidate)
- [ ] 민감 정보가 클라이언트 번들에 노출되지 않음 (NEXT_PUBLIC_* 한정)
- [ ] Authorization 헤더가 필요한 API 호출에 누락 없음
- [ ] 백엔드 응답 스키마 호환 (필요 시 `study-helper-backend` PR 함께 링크)

## 비고

<!-- 리뷰어가 알아야 할 트레이드오프, 후속 작업 등 -->
