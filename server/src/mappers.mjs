// 앱 입력 → 1FATE 도구 인자, 1FATE 응답 → 앱 화면 타입(src/types.ts)으로 변환한다.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export class InputError extends Error {}

// 앱의 BirthInput을 검증해 1FATE 인자로 바꾼다
export function toFateBirth(input, prefix = "") {
  if (!input || typeof input !== "object") throw new InputError("생년월일 정보가 없어요");
  const { birthDate, birthTime, calendar, gender, birthCity } = input;
  if (typeof birthDate !== "string" || !DATE_RE.test(birthDate)) throw new InputError("생년월일 형식이 올바르지 않아요");
  const year = Number(birthDate.slice(0, 4));
  if (year < 1900 || year > 2100) throw new InputError("1900~2100년 사이만 볼 수 있어요");
  if (gender !== "male" && gender !== "female") throw new InputError("성별 값이 올바르지 않아요");

  const args = {
    [`${prefix}birth_date`]: birthDate,
    [`${prefix}gender`]: gender,
    [`${prefix}calendar`]: calendar === "lunar" ? "lunar" : "solar",
  };
  if (typeof birthTime === "string" && TIME_RE.test(birthTime)) args[`${prefix}birth_time`] = birthTime;
  // 궁합 도구에는 도시 인자가 없다
  if (!prefix && typeof birthCity === "string" && birthCity.trim()) args.birth_city = birthCity.trim().slice(0, 40);
  return args;
}

const profile = (p) => ({ nicknameFull: p?.nickname_full ?? "", nicknameShort: p?.nickname_short ?? "" });

export function toSaju(r) {
  return {
    profile: profile(r.profile),
    typeSummary: r.type_summary_ko,
    personality: {
      firstImpression: r.personality?.first_impression_ko,
      coreTrait: r.personality?.core_trait_ko,
      strengths: r.personality?.strengths_ko,
    },
    elementTendency: r.element_tendency_ko,
    // 1FATE는 오행 개수를 주지 않아 차트는 숨긴다
    elements: null,
    supplementHint: r.supplement_hint_ko,
    lifeHints: {
      career: r.life_hints?.career_ko,
      relationship: r.life_hints?.relationship_ko,
      health: r.life_hints?.health_summary_ko,
    },
  };
}

function gradeTone(gradeEn = "") {
  const g = gradeEn.toLowerCase();
  if (g.includes("caution") || g.includes("bad")) return "caution";
  if (g.includes("excellent") || g.includes("good") || g.includes("great")) return "good";
  return "normal";
}

export function toYear(r) {
  return {
    profile: profile(r.profile),
    targetYear: r.target_year,
    koreanAge: r.korean_age,
    grade: r.grade_ko,
    gradeTone: gradeTone(r.grade_en),
    overview: r.year_overview_ko,
    keyThemes: r.key_themes_ko ?? [],
    opportunities: r.opportunities_ko ?? [],
    cautions: r.cautions_ko ?? [],
    daeun: {
      gapja: r.daeun_detail?.gapja ?? "",
      ageRange: r.daeun_detail?.age_range_ko ?? "",
      summary: r.daeun_detail?.summary_ko ?? "",
    },
    oneLine: r.one_line_ko,
    // 1FATE는 월별 흐름을 주지 않아 프리미엄 영역은 숨긴다
    months: null,
  };
}

const person = (p) => ({
  nicknameFull: p?.nickname_full ?? "",
  ilju: p?.ilju ?? "",
  // element_ko에 한자(火 등)가 들어 있다. 앱은 한자로 오행 색을 고른다
  element: p?.element_ko ?? "",
  trait: p?.trait_ko ?? "",
  impression: p?.impression_ko ?? "",
});

export function toCompat(r) {
  return {
    grade: r.grade,
    gradeLabel: r.grade_label_ko,
    person1: person(r.person1),
    person2: person(r.person2),
    chemistry: r.chemistry_ko,
    relationType: r.relation_type_ko,
    relationDesc: r.relation_desc_ko,
    strengths: (r.strengths ?? []).map((s) => s.ko),
    cautions: (r.cautions ?? []).map((s) => s.ko),
    summary: r.summary_ko,
    advice: r.advice_ko,
  };
}

// 필수 필드가 비어 있으면 응답 형식이 바뀐 것으로 보고 실패 처리한다
export function assertFields(obj, fields) {
  const missing = fields.filter((f) => obj[f] === undefined || obj[f] === null || obj[f] === "");
  if (missing.length) throw new Error(`1FATE 응답 형식이 예상과 달라요 (${missing.join(", ")})`);
  return obj;
}
