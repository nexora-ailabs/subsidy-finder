import type {
  BirthInput,
  CompatPerson,
  CompatibilityResult,
  DailyFortuneResult,
  Profile,
  SajuResult,
  YearFortuneResult,
} from "./types";

// 중간 서버(server/) 주소. 설정하면 사주·신년운세·궁합은 실제 1FATE 결과를, 비어 있으면 화면 확인용 샘플을 쓴다.
// 오늘의 운세는 1FATE 쪽 오류(get_daily_fortune longitude)가 고쳐질 때까지 샘플을 쓴다.
const API_BASE = (import.meta.env.VITE_SAJU_API_URL as string | undefined)?.replace(/\/$/, "");
export const IS_MOCK = !API_BASE;

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("네트워크 연결을 확인해 주세요");
  }
  const json = (await res.json().catch(() => null)) as { data?: T; error?: string } | null;
  if (!res.ok || !json?.data) throw new Error(json?.error ?? "운세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요");
  return json.data;
}

export function analyzeSaju(input: BirthInput): Promise<SajuResult> {
  return API_BASE ? post("/api/saju", { birth: input }) : mockAnalyzeSaju(input);
}

export function getYearFortune(input: BirthInput, targetYear = new Date().getFullYear()): Promise<YearFortuneResult> {
  return API_BASE ? post("/api/year", { birth: input, targetYear }) : mockGetYearFortune(input, targetYear);
}

export function checkCompatibility(person1: BirthInput, person2: BirthInput): Promise<CompatibilityResult> {
  return API_BASE ? post("/api/compat", { person1, person2 }) : mockCheckCompatibility(person1, person2);
}

type ElementKey = "목" | "화" | "토" | "금" | "수";

interface ElementPreset {
  hanja: string;
  word: string;
  stems: [string, string];
  typeSummary: string;
  impression: string;
  coreTrait: string;
  strengths: string;
  career: string;
  relationship: string;
  supplement: string;
}

const ELEMENT_ORDER: ElementKey[] = ["목", "화", "토", "금", "수"];

const ELEMENTS: Record<ElementKey, ElementPreset> = {
  목: {
    hanja: "木",
    word: "새싹",
    stems: ["갑", "을"],
    typeSummary: "목(木) - 곧게 뻗어 자라는 나무의 기운을 가진 분이에요.",
    impression: "곧고 믿음직한 인상",
    coreTrait: "성장을 좋아하고 원칙을 지키는 성품",
    strengths: "추진력이 있고 사람을 이끄는 힘이 있어요.",
    career: "교육, 기획, 창업처럼 무언가를 키워내는 분야",
    relationship: "서로를 북돋우며 함께 자라는 관계",
    supplement: "초록색 계열, 동쪽 방향, 아침 시간대가 도움이 돼요.",
  },
  화: {
    hanja: "火",
    word: "불꽃",
    stems: ["병", "정"],
    typeSummary: "화(火) - 태양처럼 밝게 비추는 기운을 가진 분이에요.",
    impression: "밝고 따뜻한 인상",
    coreTrait: "열정적이고 활발한 성품, 긍정적인 에너지",
    strengths: "열정적이고 활발하며 표현력이 뛰어나요.",
    career: "마케팅, 엔터테인먼트, 영업처럼 표현력이 필요한 분야",
    relationship: "활발하고 밝은 관계, 함께 성장하는 파트너십",
    supplement: "붉은색 계열, 남쪽 방향, 한낮 시간대가 도움이 돼요.",
  },
  토: {
    hanja: "土",
    word: "대지",
    stems: ["무", "기"],
    typeSummary: "토(土) - 모든 것을 품는 넓은 땅의 기운을 가진 분이에요.",
    impression: "편안하고 듬직한 인상",
    coreTrait: "신중하고 포용력 있는 성품",
    strengths: "한결같고 책임감이 강해 믿고 맡길 수 있어요.",
    career: "관리, 부동산, 상담처럼 안정과 신뢰가 중요한 분야",
    relationship: "오래 곁을 지키는 든든한 관계",
    supplement: "노란색·갈색 계열, 중앙, 환절기가 도움이 돼요.",
  },
  금: {
    hanja: "金",
    word: "금속",
    stems: ["경", "신"],
    typeSummary: "금(金) - 단단하게 벼려진 쇠의 기운을 가진 분이에요.",
    impression: "세련되고 예리한 인상",
    coreTrait: "섬세하고 완벽주의적인 성품, 미적 감각",
    strengths: "판단이 빠르고 맺고 끊음이 분명해요.",
    career: "금융, 법률, 디자인처럼 정확함과 감각이 필요한 분야",
    relationship: "약속을 지키고 신뢰를 쌓는 관계",
    supplement: "흰색·금색 계열, 서쪽 방향, 저녁 시간대가 도움이 돼요.",
  },
  수: {
    hanja: "水",
    word: "물결",
    stems: ["임", "계"],
    typeSummary: "수(水) - 유연하게 흐르는 물의 기운을 가진 분이에요.",
    impression: "차분하고 지적인 인상",
    coreTrait: "유연하고 생각이 깊은 성품",
    strengths: "상황 판단이 빠르고 어디서든 잘 적응해요.",
    career: "연구, IT, 무역처럼 지식과 흐름을 다루는 분야",
    relationship: "깊이 이해하고 공감하는 관계",
    supplement: "검정·남색 계열, 북쪽 방향, 밤 시간대가 도움이 돼요.",
  },
};

export const ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const ADJECTIVES = ["독립적인", "다정한", "당당한", "섬세한", "자유로운", "든든한"];

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

function delay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function inputKey(input: BirthInput): string {
  return `${input.birthDate}|${input.birthTime ?? ""}|${input.calendar}|${input.gender}`;
}

function dayElement(input: BirthInput): ElementKey {
  return ELEMENT_ORDER[hash(inputKey(input)) % ELEMENT_ORDER.length];
}

function lackingElement(main: ElementKey): ElementKey {
  // 주 오행이 극하는 오행을 부족한 기운으로 둔다
  return ELEMENT_ORDER[(ELEMENT_ORDER.indexOf(main) + 2) % ELEMENT_ORDER.length];
}

function birthYear(input: BirthInput): number {
  return Number(input.birthDate.slice(0, 4));
}

export function profileOf(input: BirthInput): Profile {
  const year = birthYear(input);
  const element = ELEMENTS[dayElement(input)];
  const animal = ANIMALS[(((year - 4) % 12) + 12) % 12];
  const adjective = ADJECTIVES[hash(input.birthDate) % ADJECTIVES.length];
  const name = `${adjective} ${element.word} ${animal}`;
  const genderLabel = input.gender === "male" ? "남자" : "여자";
  const calendarLabel = input.calendar === "solar" ? "양력" : "음력";
  return {
    nicknameFull: `${name} (${input.birthDate.replaceAll("-", ".")}, ${calendarLabel}, ${genderLabel})`,
    nicknameShort: `${name}(${genderLabel})`,
  };
}

function ilju(input: BirthInput): string {
  const element = ELEMENTS[dayElement(input)];
  const h = hash(input.birthDate);
  return `${element.stems[h % 2]}${BRANCHES[h % 12]}`;
}

// 여덟 글자를 오행에 나눠 담는다: 주 오행이 가장 많고, 부족한 오행은 0
function elementCounts(input: BirthInput, main: ElementKey, lacking: ElementKey) {
  const counts: Record<ElementKey, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  counts[main] = 3;
  const rest = ELEMENT_ORDER.filter((e) => e !== main && e !== lacking);
  const h = hash(`${inputKey(input)}|elements`);
  for (let i = 0; i < 5; i++) {
    counts[rest[(h >>> (i * 3)) % rest.length]] += 1;
  }
  return ELEMENT_ORDER.map((e) => ({ name: e, hanja: ELEMENTS[e].hanja, count: counts[e] }));
}

async function mockAnalyzeSaju(input: BirthInput): Promise<SajuResult> {
  const main = dayElement(input);
  const lacking = lackingElement(main);
  const preset = ELEMENTS[main];
  return delay({
    profile: profileOf(input),
    typeSummary: preset.typeSummary,
    personality: {
      firstImpression: preset.impression,
      coreTrait: preset.coreTrait,
      strengths: preset.strengths,
    },
    elementTendency: `${preset.hanja}(${main}) 기운이 강하고, ${ELEMENTS[lacking].hanja}(${lacking}) 기운이 부족해요.`,
    elements: elementCounts(input, main, lacking),
    supplementHint: ELEMENTS[lacking].supplement,
    lifeHints: {
      career: preset.career,
      relationship: preset.relationship,
      health: `${ELEMENTS[lacking].hanja}(${lacking}) 기운이 부족하니 그에 맞는 건강 관리가 필요해요.`,
    },
  });
}

const YEAR_GRADES = [
  {
    grade: "대길 (大吉)",
    tone: "good",
    overview: "하는 일마다 순풍이 부는 해예요. 미뤄둔 계획을 꺼내 보세요.",
    themes: ["도약", "확장", "인연"],
    opportunities: ["새로운 시작", "승진·이직", "좋은 사람과의 만남"],
    cautions: ["과한 자신감", "무리한 일정"],
  },
  {
    grade: "길 (吉)",
    tone: "good",
    overview: "차근차근 쌓아온 것이 결실을 맺는 해예요.",
    themes: ["결실", "안정", "성장"],
    opportunities: ["실력 인정", "재정 안정"],
    cautions: ["건강 관리", "말실수"],
  },
  {
    grade: "평 (平)",
    tone: "normal",
    overview: "큰 굴곡 없이 흘러가는 해예요. 기본기를 다지기 좋아요.",
    themes: ["균형", "꾸준함", "준비"],
    opportunities: ["자기계발", "관계 정리"],
    cautions: ["충동 소비", "게으름"],
  },
  {
    grade: "흉 (凶)",
    tone: "caution",
    overview: "신중함이 필요한 해예요. 큰 결정은 미루고 내실을 다지는 게 좋아요.",
    themes: ["인내", "신중", "정비"],
    opportunities: ["내면 성찰", "역량 강화"],
    cautions: ["큰 투자 자제", "건강 우선"],
  },
] as const;

const MONTH_NOTES: Record<number, string[]> = {
  5: ["바라던 일이 이뤄지는 달", "좋은 소식이 찾아오는 달", "자신감이 빛나는 달"],
  4: ["새로운 인연이 생기는 달", "노력이 인정받는 달", "작은 행운이 이어지는 달"],
  3: ["차분히 다지기 좋은 달", "균형을 찾는 달", "평소의 리듬을 지키는 달"],
  2: ["쉬어가며 충전할 달", "지출을 점검할 달", "말을 아끼면 좋은 달"],
  1: ["건강을 먼저 챙길 달", "큰 결정은 미룰 달", "조용히 준비하는 달"],
};

async function mockGetYearFortune(input: BirthInput, targetYear: number): Promise<YearFortuneResult> {
  const g = YEAR_GRADES[hash(`${inputKey(input)}|${targetYear}`) % YEAR_GRADES.length];
  const koreanAge = targetYear - birthYear(input) + 1;
  const daeunStart = Math.max(1, koreanAge - ((koreanAge - 1) % 10));
  const stems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
  const h = hash(input.birthDate + daeunStart);
  const gapja = `${stems[h % 10]}${BRANCHES[h % 12]}`;
  return delay({
    profile: profileOf(input),
    targetYear,
    koreanAge,
    grade: g.grade,
    gradeTone: g.tone,
    overview: g.overview,
    keyThemes: [...g.themes],
    opportunities: [...g.opportunities],
    cautions: [...g.cautions],
    daeun: {
      gapja,
      ageRange: `${daeunStart}세~${daeunStart + 9}세`,
      summary: `${daeunStart}세에 시작된 ${gapja} 대운이 흐르고 있어요.`,
    },
    oneLine: g.overview.split(".")[0] + ".",
    months: Array.from({ length: 12 }, (_, i) => {
      const score = (hash(`${inputKey(input)}|${targetYear}|${i}`) % 5) + 1;
      return { month: i + 1, score, note: MONTH_NOTES[score][i % MONTH_NOTES[score].length] };
    }),
  });
}

function compatPerson(input: BirthInput): CompatPerson {
  const main = dayElement(input);
  const preset = ELEMENTS[main];
  return {
    nicknameFull: profileOf(input).nicknameFull,
    ilju: ilju(input),
    element: preset.hanja,
    trait: preset.coreTrait,
    impression: preset.impression,
  };
}

async function mockCheckCompatibility(person1: BirthInput, person2: BirthInput): Promise<CompatibilityResult> {
  const e1 = dayElement(person1);
  const e2 = dayElement(person2);
  const i1 = ELEMENT_ORDER.indexOf(e1);
  const i2 = ELEMENT_ORDER.indexOf(e2);
  const generates = (i1 + 1) % 5 === i2 || (i2 + 1) % 5 === i1;

  const result = e1 === e2
    ? {
        grade: "B",
        gradeLabel: "닮은 인연",
        relationType: "비화",
        relationDesc: "같은 기운끼리 만나 서로를 깊이 이해하는 관계",
        strengths: ["말하지 않아도 통하는 부분이 많아요"],
        cautions: ["비슷한 단점이 겹치면 함께 흔들릴 수 있어요"],
        summary: "거울을 보듯 닮은 두 사람이에요",
        advice: "서로에게 없는 부분은 바깥에서 함께 채워 보세요.",
      }
    : generates
      ? {
          grade: "A",
          gradeLabel: "서로 살리는 인연",
          relationType: "상생",
          relationDesc: "한쪽이 다른 쪽을 자연스럽게 북돋우는 관계",
          strengths: ["함께 있으면 서로의 장점이 더 커져요"],
          cautions: ["한쪽만 주는 관계가 되지 않도록 균형이 필요해요"],
          summary: "곁에 있는 것만으로 힘이 되는 관계예요",
          advice: "고마움을 자주 표현하면 인연이 더 단단해져요.",
        }
      : {
          grade: "C",
          gradeLabel: "성장하는 인연",
          relationType: "상극",
          relationDesc: "서로 다른 기운이 부딪히며 서로를 단련시키는 관계",
          strengths: ["서로 다른 점이 매력으로 작용해요"],
          cautions: ["의견 충돌이 잦을 수 있어 이해와 배려가 필요해요"],
          summary: "서로 다른 기운이 만나 조화를 배워가는 관계예요",
          advice: "서로의 다름을 이해하려는 노력이 관계를 더 깊게 해요.",
        };

  return delay({
    ...result,
    person1: compatPerson(person1),
    person2: compatPerson(person2),
    chemistry: `${ELEMENTS[e1].hanja}(${e1})과 ${ELEMENTS[e2].hanja}(${e2})의 만남`,
  });
}

const DAILY_TITLES: Record<number, { title: string; message: string; advice: string }> = {
  5: {
    title: "반짝반짝 빛나는 날 ✨",
    message: "하고 싶었던 일을 시작하기 딱 좋은 날이에요. 먼저 다가가면 좋은 반응이 돌아와요.",
    advice: "오늘은 망설이지 말고 한 걸음 먼저 내디뎌 보세요.",
  },
  4: {
    title: "기분 좋은 바람이 부는 날 🌷",
    message: "작은 행운이 곳곳에 숨어 있어요. 주변 사람들과의 대화에서 힌트를 얻을 수 있어요.",
    advice: "고마운 사람에게 짧은 메시지를 보내 보세요.",
  },
  3: {
    title: "잔잔하고 편안한 날 ☁️",
    message: "큰 변화보다는 평소 하던 일을 차근차근 이어가기 좋은 날이에요.",
    advice: "미뤄둔 정리 정돈을 해보면 마음도 가벼워져요.",
  },
  2: {
    title: "살짝 쉬어가는 날 🍵",
    message: "에너지가 조금 낮은 날이에요. 무리한 약속은 줄이고 나를 챙겨 주세요.",
    advice: "따뜻한 차 한 잔과 함께 일찍 쉬어 보세요.",
  },
  1: {
    title: "조심조심 걸어가는 날 🐢",
    message: "말 한마디, 지출 하나에 조금 더 신경 쓰면 무난하게 지나가요.",
    advice: "중요한 결정은 하루만 미뤄 두는 게 좋아요.",
  },
};

const LUCKY_COLORS = [
  { name: "코랄 핑크", hex: "#ff7f8e" },
  { name: "라벤더", hex: "#b9a3ff" },
  { name: "민트", hex: "#6fd6b0" },
  { name: "버터 옐로", hex: "#ffd56b" },
  { name: "스카이 블루", hex: "#7fbfff" },
  { name: "크림 화이트", hex: "#f3ead8" },
];
const LUCKY_ITEMS = ["작은 거울", "헤어핀", "향수", "에코백", "립밤", "손수건", "이어폰", "다이어리"];
const LUCKY_FOODS = ["딸기 라떼", "샐러드", "떡볶이", "마카롱", "따뜻한 국수", "과일 요거트", "김밥", "초코 쿠키"];
const DIRECTIONS = ["동쪽", "서쪽", "남쪽", "북쪽"];
const CAUTION_TIMES = ["오전 9~11시", "오후 1~3시", "오후 3~5시", "저녁 7~9시"];
const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];

export function todayString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getDailyFortune(input: BirthInput, date = todayString()): Promise<DailyFortuneResult> {
  const h = hash(`${inputKey(input)}|${date}`);
  const pick = <T,>(list: T[], salt: number) => list[(h >>> salt) % list.length];
  const score = (h % 5) + 1;
  const sub = (salt: number) =>
    Math.min(5, Math.max(1, score + (hash(`${inputKey(input)}|${date}|${salt}`) % 3) - 1));
  const color = pick(LUCKY_COLORS, 3);
  const dayIndex = Math.floor(Date.parse(date) / 86400000);
  return delay(
    {
      profile: profileOf(input),
      date,
      dayGapja: `${STEMS[((dayIndex % 10) + 10) % 10]}${BRANCHES[((dayIndex % 12) + 12) % 12]}일`,
      score,
      ...DAILY_TITLES[score],
      categories: [
        { key: "love", label: "연애", emoji: "💕", score: sub(5) },
        { key: "money", label: "금전", emoji: "💰", score: sub(7) },
        { key: "work", label: "일·공부", emoji: "📚", score: sub(9) },
        { key: "health", label: "건강", emoji: "🌿", score: sub(11) },
      ],
      lucky: {
        color: color.name,
        colorHex: color.hex,
        number: ((h >>> 13) % 9) + 1,
        direction: pick(DIRECTIONS, 15),
        item: pick(LUCKY_ITEMS, 17),
        food: pick(LUCKY_FOODS, 19),
      },
      cautionTime: pick(CAUTION_TIMES, 21),
    },
    400,
  );
}

// 캐릭터 도감용: 오행 단어 × 띠 동물 = 60종
export const CHARACTER_ELEMENTS = ELEMENT_ORDER.map((e) => ({ key: e, word: ELEMENTS[e].word, hanja: ELEMENTS[e].hanja }));

const HANJA_TO_KEY: Record<string, ElementKey> = { 木: "목", 火: "화", 土: "토", 金: "금", 水: "수" };

// 결과의 별명("독립적인 불꽃 뱀(여자)")에서 띠 동물을, 오행 단서("火" 또는 "화(火) ...")에서 오행을 읽어 도감 캐릭터를 만든다.
// 1FATE 실제 결과와 샘플 결과 모두 같은 방식으로 처리한다.
export function characterFrom(nickname: string, elementHint: string): { key: string; hanja: string } | null {
  const words = nickname.replace(/\(.*?\)/g, " ").trim().split(/\s+/);
  const animal = ANIMALS.find((a) => words.includes(a));
  const hanja = elementHint.match(/[木火土金水]/)?.[0];
  if (!animal || !hanja) return null;
  return { key: `${ELEMENTS[HANJA_TO_KEY[hanja]].word} ${animal}`, hanja };
}
