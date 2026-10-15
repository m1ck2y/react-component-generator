# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

패키지 매니저와 서버 런타임은 Bun이다.

```bash
bun install
bun run dev        # API 서버(:3002, bun --watch) + Vite(:5173) 동시 실행
bun run server     # API 서버만
bun run build      # tsc -b && vite build
bun run lint       # eslint .
bun run test       # vitest run (src/ + server/ 테스트 모두)

# 단일 파일 / 단일 테스트
bunx vitest run server/generator.test.ts
bunx vitest run -t "render 호출을 주입한다"
```

- 테스트 러너는 **Vitest**다. `bun test`는 Bun 내장 러너라 jsdom·`src/test/setup.ts`가 적용되지 않으니 쓰지 않는다.
- `tsc -b`는 `src/`와 `vite.config.ts`만 타입 검사한다(`tsconfig.app.json`, `tsconfig.node.json`). `server/`는 빌드 타입 검사 대상이 아니다.
- API 키는 `.env`의 `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY` 또는 UI 직접 입력. 클라이언트 입력값이 `.env`보다 우선한다.

## 아키텍처

프롬프트 → React 컴포넌트 코드 생성 → 브라우저에서 즉시 렌더링하는 앱. 프론트와 API 서버는 별도 프로세스이고, Vite dev 서버가 `/api`를 `localhost:3002`로 프록시한다(`vite.config.ts`).

**생성 파이프라인** (여러 파일에 걸친 계약):
1. `src/hooks/useComponentGenerator.ts` → `POST /api/generate { prompt, apiKey?, provider }`
2. `server/index.ts`의 `SYSTEM_PROMPT`가 출력 형식을 강제한다: import 없음, 인라인 스타일만, 순수 JS(TS 문법 금지), 마지막 줄에 `render(<Component />)`.
3. `server/generator.ts`가 응답을 정규화한다: 코드펜스 제거(`stripCodeFences`), `render()` 호출이 없으면 주입(`ensureRenderCall`).
4. `src/components/LivePreview.tsx`가 `react-live`의 `noInline` 모드로 실행한다. `noInline`은 `render(...)` 호출이 있어야 그리고, 스코프에 `React`만 있으며 TS를 해석하지 못한다.

따라서 2~4는 한 세트다. 시스템 프롬프트 규칙, 정규화 함수, react-live 설정 중 하나를 바꾸면 나머지도 맞춰야 한다.

**프로바이더**: `anthropic`(단일 모델)과 `google`(`GOOGLE_MODELS` 순서대로 `server/fallback.ts`의 `withModelFallback`로 폴백). 새 프로바이더는 `server/index.ts`의 `Provider`/`ENV_KEYS`/호출 함수와 `src/types`·`App.tsx`의 `PROVIDER_CONFIG`를 함께 추가한다.

**서버 테스트 경계**: `server/index.ts`는 import 시 `Bun.serve`가 바로 실행되므로 테스트하지 않는다. 테스트할 로직은 부수효과 없는 모듈(`generator.ts`, `fallback.ts`처럼)로 분리해 거기서 테스트한다.

**상태**: 생성 결과는 훅의 메모리 상태뿐이라 새로고침하면 사라진다. 미리보기 새로고침은 `ComponentCard`가 `LivePreview`의 `key`를 바꿔 리마운트하는 방식이다.

## 컨벤션

- UI 문구, 에러 메시지, 테스트 이름(`it('...')`), 코드 주석은 한국어.
- 커밋은 `.claude/skills/commit` 스킬을 따른다: `feat|fix|refactor|chore: 한국어 요약`, 승인 후 커밋.

## 앱 외 디렉터리

- `hiring-lab/`: 이력서 1차 검토 실습(가상 서류). `/resume-screening hiring-lab/resumes`로 실행하며 `.claude/skills/resume-screening`과 `.claude/agents/resume-reviewer.md`를 쓴다. 결과(`hiring-lab/results/`)는 gitignore 대상.
- `.agents/skills/`는 `.claude/skills/` 일부의 Codex 공유용 복제본이다. 스킬을 고치면 양쪽을 같이 맞추고, 외부 설치 스킬은 `skills-lock.json`으로 관리된다.
