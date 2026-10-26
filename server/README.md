# 내 사주를 알아볼까요? — 1FATE 중간 서버

앱은 1FATE를 직접 부를 수 없어서(MCP 토큰을 앱에 넣으면 누구나 꺼내 쓸 수 있음) 이 서버가 토큰을 들고 대신 호출합니다.

```
앱 (토스 웹뷰) ──POST /api/saju──▶ 이 서버 ──MCP──▶ 1FATE
```

## API

모두 `POST`, `Content-Type: application/json`. 성공하면 `{ "data": ... }`, 실패하면 `{ "error": "사용자에게 보여줄 문구" }`.

| 경로 | 요청 본문 | 1FATE 도구 |
|---|---|---|
| `/api/saju` | `{ birth }` | `analyze_saju` |
| `/api/year` | `{ birth, targetYear }` | `get_year_fortune` |
| `/api/compat` | `{ person1, person2 }` | `check_compatibility` |
| `/api/daily-raw` | `{ birth }` | `get_daily_fortune` (원본 그대로, 아래 참고) |
| `GET /health` | – | – |

`birth`는 앱의 `BirthInput`: `{ birthDate: "1995-03-14", birthTime?: "14:30", calendar: "solar"|"lunar", gender: "female"|"male", birthCity?: "서울" }`

응답은 앱의 `src/types.ts` 형식으로 변환해서 돌려줍니다(`src/mappers.mjs`). 1FATE가 주지 않는 값(사주 오행 개수, 신년운세 월별 흐름)은 `null`이고, 앱은 그 영역을 숨깁니다.

## 실행

```bash
npm install
cp .env.example .env   # FATE_MCP_URL, FATE_MCP_TOKEN 채우기
npm run dev
```

앱 쪽에는 `check-my-saju/.env.local`에 서버 주소를 넣습니다.

```
VITE_SAJU_API_URL=https://내-서버-주소
```

### 1FATE 없이 로컬에서 시험하기

실제 1FATE 응답 형식을 흉내 내는 가짜 서버가 있습니다.

```bash
npm run fake-1fate                      # http://localhost:8790/mcp, 토큰 dev-token
FATE_MCP_URL=http://localhost:8790/mcp FATE_MCP_TOKEN=dev-token npm start
```

## 보호 장치

- 입력 검증(날짜 형식, 1900~2100년, 성별), 요청 크기 10KB 제한
- IP별 분당 요청 제한(`RATE_LIMIT_PER_MIN`)
- 같은 입력은 6시간 캐시 → 1FATE 호출 수 절약
- `ALLOWED_ORIGINS`로 앱 주소만 허용(CORS)
- 1FATE 오류 내용은 서버 로그에만 남기고, 앱에는 일반 문구만 보냄

## 알아둘 점

- **오늘의 운세**: 1FATE `get_daily_fortune`이 현재 `name 'longitude' is not defined` 오류를 내서 응답 형식을 확인하지 못했습니다. 그래서 `/api/daily-raw`는 원본을 그대로 넘기고, 앱은 오늘의 운세에 샘플을 계속 씁니다. 1FATE가 고쳐지면 응답을 보고 `toDaily` 변환을 추가하면 됩니다.
- **토큰 출처**: PlayMCP 개인 계정의 로그인 토큰을 서버에 넣어 모든 사용자의 요청을 처리하는 방식은 PlayMCP 이용 정책에 맞지 않을 수 있습니다. 서비스용으로는 1FATE 제작자에게 직접 API 사용을 문의해 전용 주소와 키를 받는 것을 권장합니다.
- 배포: Node 20 이상이 도는 곳이면 어디든 됩니다(Cloud Run, Render, Fly.io, AWS 등). `npm start`, 포트는 `PORT` 환경변수.
