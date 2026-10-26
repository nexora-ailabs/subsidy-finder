# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

"내 사주를 알아볼까요?" — **앱인토스**(토스 앱 안의 웹뷰 미니앱)용 사주·운세·타로 앱. 두 부분으로 나뉜다.

- `./` — React 19 + Vite + TypeScript 웹앱. `@apps-in-toss/web-framework`(`ait` CLI)로 토스용 번들을 만든다. 플랫폼 설정은 `apps-in-toss.config.ts`에 있다.
- `server/` — 의존성이 거의 없는 Node(20 이상, 순수 `.mjs`, `node:http`) 중간 서버. 1FATE MCP 토큰을 들고 앱 대신 1FATE를 호출한다. 앱에서 1FATE를 직접 부르면 안 된다(토큰이 노출됨).

```
앱 (토스 웹뷰) ──POST /api/*──▶ server/ ──MCP──▶ 1FATE
```

화면 문구와 코드 주석은 한국어다. 새 주석도 한국어로 쓴다.

## 명령어

앱 (이 디렉터리에서 실행):

```bash
npm run dev       # vite 개발 서버 (host: true라서 같은 와이파이의 폰에서도 열 수 있음)
npm run build     # tsc -b && vite build && ait build
npm run lint      # oxlint
npm run deploy    # ait deploy
```

저장소 루트의 `.claude/launch.json`에 5173 포트의 `check-my-saju` 미리보기 설정이 있다.

서버 (`server/`에서 실행):

```bash
npm run dev          # node --env-file=.env src/index.mjs (먼저 .env.example → .env 복사)
npm run fake-1fate   # 가짜 1FATE MCP 서버: http://localhost:8790/mcp, 토큰 dev-token
```

실제 1FATE 없이 앱부터 서버까지 시험하려면: `fake-1fate`를 띄우고, `FATE_MCP_URL=http://localhost:8790/mcp FATE_MCP_TOKEN=dev-token npm start`로 서버를 시작한 뒤, 앱의 `.env.local`에 `VITE_SAJU_API_URL`을 넣는다.

테스트 코드는 없다. `npm run build`(타입 검사)와 `npm run lint`로 확인한다.

## 구조

### 샘플 데이터와 실제 데이터
- `src/api.ts`: `VITE_SAJU_API_URL`이 있으면 사주·신년운세·궁합을 서버로 요청하고, 비어 있으면 샘플 결과를 쓴다(`IS_MOCK`). 샘플은 생년월일 입력을 해시해서 만들기 때문에 같은 사람은 항상 같은 결과를 본다.
- 오늘의 운세(`getDailyFortune`)는 **항상 샘플**이다. 1FATE `get_daily_fortune`이 현재 `longitude` 오류를 내서, 서버는 `/api/daily-raw`로 원본만 그대로 넘긴다. 1FATE가 고쳐지면 `server/src/mappers.mjs`에 `toDaily` 변환을 추가한다.
- `src/extra.ts`(연애운·대운·택일)는 샘플만 있다. 1FATE에 해당 도구가 없다.

### 서버 규약
- 모든 엔드포인트는 `POST` JSON이고 `{ data }` 또는 `{ error: "사용자에게 보여줄 문구" }`를 돌려준다. 1FATE 오류 내용은 서버 로그에만 남긴다.
- `server/src/mappers.mjs`가 앱의 `BirthInput`을 1FATE 인자로, 1FATE 결과를 `src/types.ts` 형식으로 바꾼다. 1FATE가 주지 않는 값은 `null`이고 앱은 그 영역을 숨긴다. `src/types.ts`와 매퍼를 함께 맞춰야 한다.
- `server/src/fate.mjs`는 MCP 클라이언트 하나를 재사용하고, 연결이 끊기면 다음 호출에서 다시 연결한다. 도구 이름 앞에는 `FATE_TOOL_PREFIX`가 붙는다(PlayMCP를 거치면 `1fate-`, 1FATE에 직접 연결하면 빈 값).
- `server/src/server.mjs`에서 입력 검증, 요청 크기 10KB 제한, IP별 요청 수 제한, 6시간 메모리 캐시, `ALLOWED_ORIGINS` 기반 CORS를 처리한다.

### 플랫폼 계층
`@apps-in-toss/web-framework`를 쓰는 곳은 `src/platform.ts` 하나뿐이다. 모든 함수가 `isInToss()`(`window`에 `ReactNativeWebView`가 있는지)를 확인하고, 브라우저에서는 웹 API(localStorage, navigator.share/clipboard, 다운로드 링크, vibrate)로 대신한다. 토스 앱 밖이거나 `src/config.ts`의 ID가 비어 있으면 광고·알림·로그인은 개발용 동작으로 바뀐다(예: `showRewardedAd()`는 바로 `true`). 새 네이티브 기능도 화면에서 SDK를 직접 import하지 말고 이 모듈을 거친다.

### 화면 전환과 상태
- 라우터가 없다. `App.tsx`가 `Screen` 유니온 타입으로 화면 컴포넌트를 바꾼다. `open()`은 `history.pushState({ screen })`을 호출하고, 뒤로 가기는 `history.back()`과 `popstate` 리스너로 처리해서 토스·안드로이드 뒤로 가기 버튼이 동작한다. 새 화면을 추가하면 `App.tsx`의 `Screen` 타입과 렌더 분기에 모두 넣어야 한다.
- 초대 링크: `src/invite.ts`가 생년월일 입력을 URL 토큰으로 만든다. `readLaunchParam()`이 `location.search`나 토스 `Environment.initialURL`에서 토큰을 읽고, 앱은 바로 궁합 화면으로 열린다.
- 저장은 `getItem`/`setItem`으로 기기에만 한다. 프로필은 `src/profile.ts`, 방문·운세·타로·캐릭터 기록은 `src/activity.ts`에서 키 하나에 JSON으로 묶어 저장한다(모듈 단위 저장소를 `useSyncExternalStore`로 노출). 저장 키에는 `-v1` 접미사가 붙어 있으니, 저장 형식을 바꾸면 버전을 올린다.
- `src/config.ts`에는 앱인토스 콘솔 값(알림 템플릿, 보상형 광고 그룹, 문의 링크)과 홈 화면의 이용자 수·후기가 있다. `USER_COUNT`와 `REVIEWS`에는 실제 숫자와 실제 후기만 넣는다.
