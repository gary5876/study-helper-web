'use client'

import { createContext, useContext, useCallback, useSyncExternalStore, ReactNode } from 'react'

export type Lang = 'ko' | 'en'

const STORAGE_KEY = 'sh_lang'

const langListeners = new Set<() => void>()
function subscribeLang(cb: () => void) {
  langListeners.add(cb)
  return () => { langListeners.delete(cb) }
}
function notifyLang() {
  langListeners.forEach(l => l())
}
function getLangSnapshot(): Lang {
  return (localStorage.getItem(STORAGE_KEY) as Lang) ?? 'ko'
}
function getLangServerSnapshot(): Lang {
  return 'ko'
}

interface LangContextType {
  lang: Lang
  toggle: () => void
  t: Strings
}

const LangContext = createContext<LangContextType | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, getLangSnapshot, getLangServerSnapshot)

  const toggle = useCallback(() => {
    const next: Lang = (localStorage.getItem(STORAGE_KEY) as Lang ?? 'ko') === 'ko' ? 'en' : 'ko'
    localStorage.setItem(STORAGE_KEY, next)
    notifyLang()
  }, [])

  const t = STRINGS[lang]

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}

export const STRINGS = {
  ko: {
    // Common
    appName: '공부 도우미',
    dashboard: '대시보드',
    settings: '설정',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    confirm: '확인',
    loading: '불러오는 중…',
    error: '오류가 발생했습니다',

    // Dashboard
    dashMyMaterials: '내 학습 자료',
    dashUploadPdf: 'PDF 업로드',
    dashNoSessions: '아직 학습 자료가 없습니다',
    dashFirstUpload: '첫 PDF 업로드하기',
    dashPages: '페이지',
    dashWords: '자',
    dashStudy: '학습하기',
    dashStatusPending: '생성 중',
    dashStatusComplete: '완료',
    dashStatusFailed: '실패',
    dashDueTitle: '오늘 복습할 문제',
    dashDueSubtitle: '간격 반복 일정에 따라 복습이 필요한 문제입니다',
    dashDueCount: '{count}개의 문제',
    dashDueStudy: '복습하기',
    dashDueEmpty: '오늘 복습할 문제가 없습니다 🎉',
    dashDueSession: '세션',
    dashDeleteConfirm: '이 세션을 삭제하시겠습니까? 관련 복습 일정도 함께 제거됩니다.',
    dashDelete: '삭제',

    // Subjects
    subAll: '전체',
    subUncategorized: '미분류',
    subAddSubject: '+ 과목 추가',
    subAddTitle: '과목 추가',
    subNamePlaceholder: '과목명 입력...',
    subCreate: '만들기',
    subDeleteConfirm: '이 과목을 삭제하시겠습니까? 세션은 유지되지만 미분류로 변경됩니다.',
    subNoneInCategory: '이 카테고리에 세션이 없습니다',

    // Upload
    uploadTitle: 'PDF 업로드',
    uploadDesc: 'PDF를 업로드하면 AI가 학습 노트, 객관식, 빈칸 문제를 자동으로 생성합니다.',
    uploadDragDrop: 'PDF를 드래그하거나 클릭해서 선택',
    uploadMaxSize: '최대 20MB · 최대 50페이지',
    uploadUploading: 'PDF 업로드 중...',
    uploadGenerating: 'AI가 학습 자료를 생성하고 있습니다...',
    uploadWait: '잠시만 기다려주세요 (보통 30초~2분)',
    uploadDone: '학습 자료가 생성됐습니다!',
    uploadViewResult: '결과 보기',
    uploadAnother: '다른 PDF 업로드',
    uploadToDashboard: '대시보드로',
    uploadError: '오류가 발생했습니다',
    uploadRetry: '다시 시도',
    uploadCheckApiKey: 'API 키 확인',
    uploadPdfOnly: 'PDF 파일만 업로드 가능합니다.',
    uploadTooLarge: '파일 크기가 20MB를 초과합니다.',
    // Upload consent
    consentTitle: '업로드 전 확인해 주세요',
    consentPdfTitle: 'PDF 내용 외부 전송',
    consentPdfBody: '업로드한 PDF의 텍스트는 선택하신 AI 서비스(Anthropic, OpenAI, TimelyGPT)의 서버로 전송되어 학습 자료 생성에 사용됩니다. 각 서비스의 개인정보처리방침이 적용되므로 개인정보나 기밀이 포함된 파일은 업로드하지 않도록 주의해 주세요.',
    consentShareTitle: '생성된 자료의 공유 가능성',
    consentShareBody: '동일한 PDF로 생성된 학습 자료(문제, 노트)는 서버의 문제은행에 저장되며, 같은 파일을 업로드한 다른 사용자에게도 제공될 수 있습니다.',
    consentKeyTitle: 'API 키 처리',
    consentKeyBody: '입력한 API 키는 브라우저 로컬 저장소에 보관되며, 학습 자료 생성 요청 시 서버로 전송됩니다. 서버는 API 키를 저장하지 않습니다.',
    consentCopyrightTitle: '저작권 준수',
    consentCopyrightBody: '업로드하는 파일에 대한 적법한 사용 권한은 사용자 본인에게 있습니다. 저작권법에 의해 보호되는 자료를 권한 없이 업로드하는 행위는 이용약관 위반이며, 그에 따른 법적 책임은 사용자 본인이 부담합니다.',
    consentAgree: '확인하고 계속하기',

    uploadSubjectTitle: '어떤 과목인가요?',
    uploadSubjectDesc: '과목을 선택하거나 새로 만드세요.',
    uploadNewSubject: '+ 새 과목',
    uploadStart: '생성 시작',

    // Study
    studyBackToDashboard: '← 대시보드',
    studyNotes: '학습 노트',
    studyChangeMode: '모드 변경',
    studyLoadError: '학습 자료를 불러올 수 없습니다.',
    studyLoadFailed: '불러오기 실패',

    // Mode Select
    modeTitle: '학습 모드를 선택하세요',
    modeDesc: '목적에 맞는 난이도로 문제를 풀어보세요.',
    modeLight: '가볍게 공부',
    modeLightDesc: '기초 개념을 확인하는 부담 없는 문제입니다. 처음 접하는 내용이거나 빠르게 훑을 때 적합합니다.',
    modeExam: '시험 대비',
    modeExamDesc: '실전 시험 수준의 문제입니다. 개념 적용부터 복합 분석까지 골고루 출제됩니다.',
    modeMax: '최고난도',
    modeMaxDesc: '변별력 있는 최상위 문제만 모았습니다. 비판적 사고와 심화 이해가 필요합니다.',

    // Study Notes
    noteKeyConcepts: '핵심 개념',
    noteSummaries: '요약',
    noteGlossary: '용어집',
    noteStartTest: '테스트 시작',
    noteClose: '닫기',
    noteImportanceHigh: '높음',
    noteImportanceMedium: '보통',
    noteImportanceLow: '낮음',
    noteImportanceSuffix: ' 중요도',

    // Score
    scoreResult: '결과',
    scoreCorrect: '정답',
    scoreRetry: '다시 풀기',
    scoreToDashboard: '대시보드로',
    scoreReviewWrong: '오답 복습',

    // Wrong Answer Review
    wrongNoMistakes: '오답이 없어요 — 훌륭합니다!',
    wrongHome: '홈으로',
    wrongIntro: '각 오답을 복습하고 현재 이해도를 표시해주세요.',
    wrongYourAnswer: '내 답변:',
    wrongCorrectAnswer: '정답:',
    wrongExplanation: '설명:',
    wrongViewConcept: '관련 개념 보기',
    wrongHowDoYouFeel: '지금 이해도는?',
    wrongGotIt: '알겠어요 ✓',
    wrongNeedsHint: '힌트 필요',
    wrongStillConfused: '아직 헷갈려요',
    wrongRetryConfused: '헷갈리는 문제 재시도',
    wrongAllDone: '완료!',
    wrongSaving: '저장 중...',

    // Concept Review
    conceptBackToReview: '← 복습으로 돌아가기',
    conceptRelatedSections: '관련 섹션',
    conceptGlossary: '용어집',

    // Fill-in-the-blank
    fillPlaceholder: '답을 입력하세요…',
    fillShowHint: '힌트 보기',
    fillHintPrefix: '힌트: ',
    fillSubmit: '제출',
    fillCorrect: '정답입니다!',
    fillWrongPrefix: '정답: ',

    // Settings
    settingsTitle: '설정',
    settingsAccount: '계정',
    settingsChangePassword: '비밀번호 변경',
    settingsLogout: '로그아웃',
    settingsDeleteAccount: '계정 삭제',
    settingsAiService: 'AI 서비스 설정',
    settingsApiKeySetup: 'API 키 설정',

    // Login
    loginTitle: '로그인',
    loginEmail: '이메일',
    loginPassword: '비밀번호',
    loginSubmit: '로그인',
    loginSignup: '회원가입',
    loginWithGoogle: 'Google로 로그인',

    // Privacy
    privacyTitle: '개인정보처리방침',

    // Language toggle
    langToggle: 'EN',
  },
  en: {
    // Common
    appName: 'Study Helper',
    dashboard: 'Dashboard',
    settings: 'Settings',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    confirm: 'Confirm',
    loading: 'Loading…',
    error: 'Something went wrong',

    // Dashboard
    dashMyMaterials: 'My Materials',
    dashUploadPdf: 'Upload PDF',
    dashNoSessions: 'No materials yet',
    dashFirstUpload: 'Upload your first PDF',
    dashPages: 'pages',
    dashWords: 'words',
    dashStudy: 'Study',
    dashStatusPending: 'Generating',
    dashStatusComplete: 'Ready',
    dashStatusFailed: 'Failed',
    dashDueTitle: "Today's Reviews",
    dashDueSubtitle: 'Questions scheduled for spaced repetition review',
    dashDueCount: '{count} questions',
    dashDueStudy: 'Review',
    dashDueEmpty: 'No reviews due today 🎉',
    dashDueSession: 'session',
    dashDeleteConfirm: 'Delete this session? Related review schedules will also be removed.',
    dashDelete: 'Delete',

    // Subjects
    subAll: 'All',
    subUncategorized: 'Uncategorized',
    subAddSubject: '+ Add Subject',
    subAddTitle: 'Add Subject',
    subNamePlaceholder: 'Subject name...',
    subCreate: 'Create',
    subDeleteConfirm: 'Delete this subject? Sessions will be kept but become uncategorized.',
    subNoneInCategory: 'No sessions in this category',

    // Upload
    uploadTitle: 'Upload PDF',
    uploadDesc: 'Upload a PDF and AI will generate study notes, MCQs, and fill-in-the-blank questions.',
    uploadDragDrop: 'Drag & drop a PDF or click to select',
    uploadMaxSize: 'Max 20MB · Up to 50 pages',
    uploadUploading: 'Uploading PDF...',
    uploadGenerating: 'AI is generating study materials...',
    uploadWait: 'Please wait (usually 30s–2min)',
    uploadDone: 'Study materials are ready!',
    uploadViewResult: 'View Result',
    uploadAnother: 'Upload Another',
    uploadToDashboard: 'Dashboard',
    uploadError: 'Something went wrong',
    uploadRetry: 'Try Again',
    uploadCheckApiKey: 'Check API Key',
    uploadPdfOnly: 'Only PDF files are accepted.',
    uploadTooLarge: 'File size exceeds 20MB.',
    // Upload consent
    consentTitle: 'Before you upload',
    consentPdfTitle: 'PDF content leaves your browser',
    consentPdfBody: 'The text of your PDF is sent to the AI service you selected (Anthropic, OpenAI, TimelyGPT) for generating study materials. Each provider has its own privacy policy — please avoid uploading files containing personal or confidential information.',
    consentShareTitle: 'Generated content may be shared',
    consentShareBody: 'Study materials (questions, notes) generated from the same PDF are saved to a shared question bank and may be served to other users who upload the same file.',
    consentKeyTitle: 'How your API key is handled',
    consentKeyBody: 'Your API key is stored in the browser local storage and sent to the server only when generating study materials. The server does not persist API keys.',
    consentCopyrightTitle: 'Copyright compliance',
    consentCopyrightBody: 'You are responsible for having the legal right to upload each file. Uploading copyrighted material without permission violates the terms of service, and the resulting legal liability is yours.',
    consentAgree: 'I understand, continue',

    uploadSubjectTitle: 'Which subject?',
    uploadSubjectDesc: 'Select a subject or create a new one.',
    uploadNewSubject: '+ New Subject',
    uploadStart: 'Start',

    // Study
    studyBackToDashboard: '← Dashboard',
    studyNotes: 'Study Notes',
    studyChangeMode: 'Change Mode',
    studyLoadError: 'Could not load study materials.',
    studyLoadFailed: 'Load Failed',

    // Mode Select
    modeTitle: 'Choose a Study Mode',
    modeDesc: 'Pick the difficulty that matches your goal.',
    modeLight: 'Light Study',
    modeLightDesc: 'Easy recall and comprehension questions. Great for a first pass or a quick review.',
    modeExam: 'Exam Prep',
    modeExamDesc: 'Exam-level questions ranging from application to complex analysis.',
    modeMax: 'Maximum Difficulty',
    modeMaxDesc: 'Only the hardest questions. Requires critical thinking and deep understanding.',

    // Study Notes
    noteKeyConcepts: 'Key Concepts',
    noteSummaries: 'Summaries',
    noteGlossary: 'Glossary',
    noteStartTest: 'Start Quiz',
    noteClose: 'Close',
    noteImportanceHigh: 'High',
    noteImportanceMedium: 'Medium',
    noteImportanceLow: 'Low',
    noteImportanceSuffix: ' importance',

    // Score
    scoreResult: 'Result',
    scoreCorrect: 'correct',
    scoreRetry: 'Try Again',
    scoreToDashboard: 'Dashboard',
    scoreReviewWrong: 'Review Mistakes',

    // Wrong Answer Review
    wrongNoMistakes: 'No mistakes — great work!',
    wrongHome: 'Home',
    wrongIntro: 'Review each mistake and mark how well you understand it now.',
    wrongYourAnswer: 'Your answer:',
    wrongCorrectAnswer: 'Correct answer:',
    wrongExplanation: 'Explanation:',
    wrongViewConcept: 'View Related Concept',
    wrongHowDoYouFeel: 'How do you feel now?',
    wrongGotIt: 'Got It ✓',
    wrongNeedsHint: 'Needs Hint',
    wrongStillConfused: 'Still Confused',
    wrongRetryConfused: 'Retry Confused Items',
    wrongAllDone: 'All Done!',
    wrongSaving: 'Saving...',

    // Concept Review
    conceptBackToReview: '← Back to Review',
    conceptRelatedSections: 'Related Sections',
    conceptGlossary: 'Glossary',

    // Fill-in-the-blank
    fillPlaceholder: 'Type your answer…',
    fillShowHint: 'Show Hint',
    fillHintPrefix: 'Hint: ',
    fillSubmit: 'Submit',
    fillCorrect: 'Correct!',
    fillWrongPrefix: 'The answer is: ',

    // Settings
    settingsTitle: 'Settings',
    settingsAccount: 'Account',
    settingsChangePassword: 'Change Password',
    settingsLogout: 'Log Out',
    settingsDeleteAccount: 'Delete Account',
    settingsAiService: 'AI Service Settings',
    settingsApiKeySetup: 'API Key Setup',

    // Login
    loginTitle: 'Log In',
    loginEmail: 'Email',
    loginPassword: 'Password',
    loginSubmit: 'Log In',
    loginSignup: 'Sign Up',
    loginWithGoogle: 'Continue with Google',

    // Privacy
    privacyTitle: 'Privacy Policy',

    // Language toggle
    langToggle: '한',
  },
} as const

export type Strings = { [K in keyof typeof STRINGS['ko']]: string }
