// 앱 ↔ 1FATE 중간 서버. 앱은 이 서버의 REST API만 부르고, 서버가 1FATE MCP 토큰을 들고 대신 호출한다.
import { createServer } from "node:http";
import { callFate, FateError } from "./fate.mjs";
import { assertFields, InputError, toCompat, toFateBirth, toSaju, toYear } from "./mappers.mjs";

// 쉼표로 여러 개. 비우면 모든 출처 허용(개발용)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const RATE_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN ?? 30);
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_MAX = 2000;

// 같은 생년월일 결과는 하루 안에서 바뀌지 않으므로 캐시해 1FATE 호출을 줄인다
const cache = new Map();
function cached(key, load) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = load().catch((err) => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
  return value;
}

// IP별 분당 요청 수 제한
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear();
  return recent.length > RATE_LIMIT_PER_MIN;
}

const routes = {
  "/api/saju": async (body) => {
    const args = toFateBirth(body.birth);
    const r = await cached(`saju:${JSON.stringify(args)}`, () => callFate("analyze_saju", args));
    return assertFields(toSaju(r), ["typeSummary", "elementTendency"]);
  },
  "/api/year": async (body) => {
    const args = toFateBirth(body.birth);
    const year = Number(body.targetYear);
    if (Number.isInteger(year) && year >= 1900 && year <= 2100) args.target_year = year;
    const r = await cached(`year:${JSON.stringify(args)}`, () => callFate("get_year_fortune", args));
    return assertFields(toYear(r), ["grade", "overview"]);
  },
  "/api/compat": async (body) => {
    const args = { ...toFateBirth(body.person1, "person1_"), ...toFateBirth(body.person2, "person2_") };
    const r = await cached(`compat:${JSON.stringify(args)}`, () => callFate("check_compatibility", args));
    return assertFields(toCompat(r), ["grade", "gradeLabel"]);
  },
  // 1FATE 오늘의 운세는 현재 서버 쪽 오류(longitude)로 응답 형식을 확인하지 못해 원본을 그대로 넘긴다
  "/api/daily-raw": async (body) => {
    const args = toFateBirth(body.birth);
    return callFate("get_daily_fortune", args);
  },
};

function corsHeaders(origin) {
  const allow = !ALLOWED_ORIGINS.length ? "*" : ALLOWED_ORIGINS.includes(origin) ? origin : "";
  return allow
    ? {
        "Access-Control-Allow-Origin": allow,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        Vary: "Origin",
      }
    : {};
}

function send(res, status, data, headers) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 10_000) throw new InputError("요청이 너무 커요");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw new InputError("JSON 형식이 올바르지 않아요");
  }
}

export const server = createServer(async (req, res) => {
  const headers = corsHeaders(req.headers.origin ?? "");
  const path = new URL(req.url ?? "/", "http://localhost").pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    return res.end();
  }
  if (req.method === "GET" && path === "/health") return send(res, 200, { ok: true }, headers);

  const handler = routes[path];
  if (!handler || req.method !== "POST") return send(res, 404, { error: "없는 경로예요" }, headers);

  const ip = String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "").split(",")[0].trim();
  if (rateLimited(ip)) return send(res, 429, { error: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요" }, headers);

  try {
    const body = await readJson(req);
    const data = await handler(body);
    return send(res, 200, { data }, headers);
  } catch (err) {
    if (err instanceof InputError) return send(res, 400, { error: err.message }, headers);
    console.error(`[${path}]`, err.message);
    const status = err instanceof FateError ? 502 : 500;
    return send(res, status, { error: "운세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요" }, headers);
  }
});
