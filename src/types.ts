export type Gender = "male" | "female";
export type Calendar = "solar" | "lunar";

export interface BirthInput {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  calendar: Calendar;
  gender: Gender;
  birthCity?: string;
}

export interface Profile {
  nicknameFull: string;
  nicknameShort: string;
}

// 1FATE analyze_saju 응답 중 화면에 쓰는 필드
export interface SajuResult {
  profile: Profile;
  typeSummary: string;
  personality: {
    firstImpression: string;
    coreTrait: string;
    strengths: string;
  };
  elementTendency: string;
  // 사주 여덟 글자의 오행 분포 (합계 8). 1FATE가 주지 않으면 null
  elements: { name: string; hanja: string; count: number }[] | null;
  supplementHint: string;
  lifeHints: {
    career: string;
    relationship: string;
    health: string;
  };
}

// 1FATE get_year_fortune 응답 중 화면에 쓰는 필드
export interface YearFortuneResult {
  profile: Profile;
  targetYear: number;
  koreanAge: number;
  grade: string;
  gradeTone: "good" | "normal" | "caution";
  overview: string;
  keyThemes: string[];
  opportunities: string[];
  cautions: string[];
  daeun: {
    gapja: string;
    ageRange: string;
    summary: string;
  };
  oneLine: string;
  // 프리미엄: 월별 흐름. 1FATE가 주지 않으면 null
  months: { month: number; score: number; note: string }[] | null;
}

// 1FATE get_daily_fortune 응답 중 화면에 쓰는 필드
export interface DailyFortuneResult {
  profile: Profile;
  date: string; // YYYY-MM-DD
  dayGapja: string;
  score: number; // 1~5
  title: string;
  message: string;
  categories: { key: "love" | "money" | "work" | "health"; label: string; emoji: string; score: number }[];
  lucky: {
    color: string;
    colorHex: string;
    number: number;
    direction: string;
    item: string;
    food: string;
  };
  cautionTime: string;
  advice: string;
}

export interface CompatPerson {
  nicknameFull: string;
  ilju: string;
  element: string;
  trait: string;
  impression: string;
}

// 1FATE check_compatibility 응답 중 화면에 쓰는 필드
export interface CompatibilityResult {
  grade: string;
  gradeLabel: string;
  person1: CompatPerson;
  person2: CompatPerson;
  chemistry: string;
  relationType: string;
  relationDesc: string;
  strengths: string[];
  cautions: string[];
  summary: string;
  advice: string;
}
