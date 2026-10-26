// 연애운 · 대운 · 택일. 1FATE에 해당 도구가 없어 지금은 입력값에서 결정적으로 만든 샘플 결과를 돌려준다.
import { profileOf, todayString } from "./api";
import type { BirthInput, Profile } from "./types";

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

const key = (i: BirthInput) => `${i.birthDate}|${i.birthTime ?? ""}|${i.calendar}|${i.gender}`;
const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 500));
const pick = <T,>(list: T[], h: number) => list[h % list.length];

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const STEM_HANJA: Record<string, string> = { 갑: "木", 을: "木", 병: "火", 정: "火", 무: "土", 기: "土", 경: "金", 신: "金", 임: "水", 계: "水" };

/* ===== 연애운 ===== */

export interface LoveFortuneResult {
  profile: Profile;
  score: number;
  title: string;
  message: string;
  monthFlow: string;
  idealType: string[];
  luckySpot: string;
  luckyDay: string;
  tips: string[];
  caution: string;
  single: string;
  couple: string;
}

const LOVE_TITLES: Record<number, [string, string]> = {
  5: ["설렘이 가득한 시기 💘", "마음을 표현하면 그대로 닿는 때예요. 망설였던 말을 꺼내 보세요."],
  4: ["따뜻한 기운이 감도는 시기 🌷", "자연스러운 만남 속에서 좋은 인연이 다가와요."],
  3: ["천천히 다가가는 시기 ☁️", "서두르지 않고 대화를 쌓을수록 관계가 깊어져요."],
  2: ["나를 먼저 돌보는 시기 🍵", "상대보다 내 마음을 먼저 들여다보면 답이 보여요."],
  1: ["한 박자 쉬어가는 시기 🐢", "오해가 생기기 쉬우니 말 한마디를 조금 더 다정하게 해 보세요."],
};

export async function getLoveFortune(input: BirthInput, date = todayString()): Promise<LoveFortuneResult> {
  const h = hash(`${key(input)}|${date.slice(0, 7)}|love`);
  const score = (h % 5) + 1;
  const [title, message] = LOVE_TITLES[score];
  return delay({
    profile: profileOf(input),
    score,
    title,
    message,
    monthFlow: pick(
      [
        "이번 달 초에는 새로운 사람을 만날 기회가, 중순 이후에는 기존 관계가 깊어지는 흐름이에요.",
        "이번 달은 친구처럼 편한 사이에서 설렘이 시작될 수 있어요.",
        "이번 달 후반, 오래 연락이 없던 사람에게서 소식이 올 수 있어요.",
        "이번 달은 혼자만의 시간을 즐길수록 매력이 더 빛나요.",
      ],
      h >>> 3,
    ),
    idealType: pick(
      [
        ["다정하고 세심한 사람", "대화가 잘 통하는 사람", "약속을 잘 지키는 사람"],
        ["유머 감각이 있는 사람", "에너지가 밝은 사람", "취미를 함께할 수 있는 사람"],
        ["차분하고 듬직한 사람", "생활력이 있는 사람", "내 이야기를 잘 들어주는 사람"],
        ["열정적인 사람", "목표가 뚜렷한 사람", "솔직하게 표현하는 사람"],
      ],
      h >>> 5,
    ),
    luckySpot: pick(["조용한 카페", "전시회", "공원 산책길", "서점", "작은 공연장", "동네 맛집"], h >>> 7),
    luckyDay: pick(["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"], h >>> 9),
    tips: pick(
      [
        ["먼저 안부를 물어보세요", "밝은 색 옷이 행운을 불러요", "작은 칭찬을 아끼지 마세요"],
        ["새로운 모임에 나가 보세요", "답장은 조금 천천히 해도 괜찮아요", "향수로 분위기를 바꿔 보세요"],
        ["오래된 친구를 다시 만나 보세요", "솔직한 마음을 짧게 전해 보세요", "함께 걷는 데이트가 좋아요"],
      ],
      h >>> 11,
    ),
    caution: pick(
      ["지난 연애와 비교하는 말은 피하세요", "감정이 격할 때는 메시지를 보내지 마세요", "주변 사람의 말에 너무 흔들리지 마세요"],
      h >>> 13,
    ),
    single: pick(
      ["소개나 모임에서 좋은 인연을 만날 수 있어요", "지금은 나를 가꾸는 시간이 다음 인연을 불러와요", "가까운 곳에 이미 마음을 둔 사람이 있을 수 있어요"],
      h >>> 15,
    ),
    couple: pick(
      ["함께 새로운 경험을 하면 관계가 깊어져요", "작은 기념일을 챙기면 큰 감동이 돼요", "서운한 점은 쌓아두지 말고 부드럽게 이야기하세요"],
      h >>> 17,
    ),
  });
}

/* ===== 대운 ===== */

export interface DaeunCycle {
  startAge: number;
  endAge: number;
  gapja: string;
  hanja: string;
  score: number;
  theme: string;
  desc: string;
}

export interface DaeunResult {
  profile: Profile;
  koreanAge: number;
  currentIndex: number;
  cycles: DaeunCycle[];
}

const DAEUN_THEMES: Record<string, [string, string][]> = {
  木: [
    ["성장과 배움", "새로운 분야를 배우고 실력을 키우기 좋은 10년이에요."],
    ["확장과 도전", "활동 범위가 넓어지고 새로운 시작이 많은 시기예요."],
  ],
  火: [
    ["표현과 인기", "나를 드러낼수록 기회가 따라오는 화려한 시기예요."],
    ["열정과 성취", "열심히 한 만큼 눈에 보이는 결과가 나오는 시기예요."],
  ],
  土: [
    ["안정과 기반", "생활의 기반을 다지고 자산을 모으기 좋은 시기예요."],
    ["신뢰와 책임", "맡는 역할이 커지고 주변의 신뢰를 얻는 시기예요."],
  ],
  金: [
    ["결실과 정리", "그동안의 노력이 결실을 맺고 불필요한 것을 정리하는 시기예요."],
    ["결단과 전환", "중요한 선택을 통해 방향을 새로 잡는 시기예요."],
  ],
  水: [
    ["지혜와 휴식", "내면을 채우고 큰 그림을 그리기 좋은 시기예요."],
    ["흐름과 인연", "사람을 통해 기회가 들어오는 유연한 시기예요."],
  ],
};

export async function getDaeun(input: BirthInput): Promise<DaeunResult> {
  const h = hash(`${key(input)}|daeun`);
  const startAge = (h % 9) + 1;
  const forward = (h >>> 4) % 2 === 0;
  const koreanAge = new Date().getFullYear() - Number(input.birthDate.slice(0, 4)) + 1;
  const s0 = (h >>> 6) % 10;
  const b0 = (h >>> 10) % 12;
  const cycles: DaeunCycle[] = Array.from({ length: 9 }, (_, i) => {
    const step = forward ? i : -i;
    const stem = STEMS[(((s0 + step) % 10) + 10) % 10];
    const branch = BRANCHES[(((b0 + step) % 12) + 12) % 12];
    const hanja = STEM_HANJA[stem];
    const [theme, desc] = pick(DAEUN_THEMES[hanja], (h >>> (i + 3)) as number);
    return {
      startAge: startAge + i * 10,
      endAge: startAge + i * 10 + 9,
      gapja: `${stem}${branch}`,
      hanja,
      score: (hash(`${key(input)}|daeun|${i}`) % 5) + 1,
      theme,
      desc,
    };
  });
  const currentIndex = Math.max(0, cycles.findIndex((c) => koreanAge >= c.startAge && koreanAge <= c.endAge));
  return delay({ profile: profileOf(input), koreanAge, currentIndex, cycles });
}

/* ===== 택일 ===== */

export type TaekilPurpose = "move" | "wedding" | "business" | "contract" | "date";

export const TAEKIL_PURPOSES: { key: TaekilPurpose; label: string; emoji: string }[] = [
  { key: "date", label: "데이트·고백", emoji: "💌" },
  { key: "move", label: "이사", emoji: "🏠" },
  { key: "contract", label: "계약·면접", emoji: "📝" },
  { key: "business", label: "개업·시작", emoji: "🎉" },
  { key: "wedding", label: "결혼·상견례", emoji: "💍" },
];

const REASONS: Record<TaekilPurpose, string[]> = {
  date: ["마음이 잘 전해지는 날", "분위기가 부드럽게 흐르는 날", "서로의 기운이 잘 어울리는 날"],
  move: ["새 터의 기운이 편안한 날", "새 출발의 기운이 깃든 날", "이동하는 기운이 순조로운 날"],
  contract: ["말과 글이 힘을 얻는 날", "신뢰가 쌓이는 날", "판단이 또렷해지는 날"],
  business: ["시작하는 기운이 강한 날", "사람이 모이는 날", "재물 기운이 들어오는 날"],
  wedding: ["두 집안의 기운이 조화로운 날", "축복이 모이는 날", "오래도록 함께할 기운의 날"],
};

export interface TaekilDay {
  date: string;
  weekday: string;
  grade: "대길" | "길";
  gapja: string;
  reason: string;
}

export interface TaekilResult {
  purpose: TaekilPurpose;
  year: number;
  month: number;
  good: TaekilDay[];
  avoid: TaekilDay[];
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export async function getGoodDays(input: BirthInput, purpose: TaekilPurpose, year: number, month: number): Promise<TaekilResult> {
  const days = new Date(year, month, 0).getDate();
  const today = todayString();
  const scored = Array.from({ length: days }, (_, i) => {
    const date = todayString(new Date(year, month - 1, i + 1));
    const h = hash(`${key(input)}|${purpose}|${date}`);
    const dayIndex = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
    return {
      date,
      weekday: WEEKDAYS[new Date(year, month - 1, i + 1).getDay()],
      score: h % 100,
      gapja: `${STEMS[((dayIndex % 10) + 10) % 10]}${BRANCHES[((dayIndex % 12) + 12) % 12]}`,
      reason: pick(REASONS[purpose], h >>> 7),
    };
  }).filter((d) => d.date >= today);
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const good = sorted
    .slice(0, 5)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ date: d.date, weekday: d.weekday, gapja: d.gapja, reason: d.reason, grade: d.score >= 85 ? ("대길" as const) : ("길" as const) }));
  const avoid = sorted
    .slice(-2)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ date: d.date, weekday: d.weekday, gapja: d.gapja, grade: "길" as const, reason: "기운이 엇갈려 피하는 게 좋은 날" }));
  return delay({ purpose, year, month, good, avoid });
}
