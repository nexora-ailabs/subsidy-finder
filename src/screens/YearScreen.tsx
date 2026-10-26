import { useState } from "react";
import { getYearFortune } from "../api";
import { EMPTY_BIRTH, isBirthValid } from "../birth";
import { BirthForm } from "../components/BirthForm";
import { BottomCTA, Card, Chips, InfoRow, Loading, LockedSection, MascotSay, ResultFooter, ShareActions, TopBar } from "../components/ui";
import type { BirthInput, YearFortuneResult } from "../types";

const THIS_YEAR = new Date().getFullYear();

export function YearScreen({ onBack, initial }: { onBack: () => void; initial?: BirthInput | null }) {
  const [input, setInput] = useState<BirthInput>(initial ?? EMPTY_BIRTH);
  const [targetYear, setTargetYear] = useState(THIS_YEAR);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YearFortuneResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await getYearFortune(input, targetYear));
    } catch (err) {
      setError(err instanceof Error ? err.message : "운세를 불러오지 못했어요");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="신년운세" onBack={onBack} />
        <Loading text={`${targetYear}년의 흐름을 읽고 있어요`} />
      </>
    );
  }

  if (result) {
    return (
      <>
        <TopBar title="신년운세" onBack={() => setResult(null)} />
        <div className="result-hero theme-year">
          <span className="result-sticker" aria-hidden="true">
            🍀
          </span>
          <p className="result-eyebrow">
            {result.profile.nicknameShort} · {result.targetYear}년 · {result.koreanAge}세
          </p>
          <span className={`grade-badge grade-${result.gradeTone}`}>{result.grade}</span>
          <h2 className="result-title">{result.overview}</h2>
        </div>

        <Card title="올해의 키워드" eyebrow="KEYWORDS">
          <Chips items={result.keyThemes.map((t) => `# ${t}`)} />
        </Card>

        <Card title="이런 기회가 와요" eyebrow="OPPORTUNITY">
          <Chips items={result.opportunities} tone="green" />
        </Card>

        <Card title="이건 조심해요" eyebrow="CAUTION">
          <Chips items={result.cautions} tone="red" />
        </Card>

        <Card title="대운 흐름" eyebrow="10-YEAR CYCLE">
          <dl className="info-list">
            <InfoRow label="대운">{result.daeun.gapja}</InfoRow>
            <InfoRow label="나이">{result.daeun.ageRange}</InfoRow>
          </dl>
          <p className="card-text">{result.daeun.summary}</p>
        </Card>

        {result.months && (
        <LockedSection title="월별 흐름" eyebrow="12 MONTHS" preview="1월 ♥♥♥♡♡ 차분히 다지기 좋은 달 · 2월 ♥♥♥♥♡ 새로운 인연이 생기는 달 · 3월 ♥♥♥♥♥ 바라던 일이…">
          <ul className="month-list">
            {result.months.map((m) => (
              <li key={m.month} className="month-row">
                <span className="month-num">{m.month}월</span>
                <span className="month-score" aria-label={`5점 만점에 ${m.score}점`}>
                  {"♥".repeat(m.score)}
                  <span className="muted">{"♡".repeat(5 - m.score)}</span>
                </span>
                <span className="month-note">{m.note}</span>
              </li>
            ))}
          </ul>
        </LockedSection>
        )}

        <Card>
          <p className="one-line-label">💌 호가 전하는 올해의 한마디</p>
          <p className="one-line">“{result.oneLine}”</p>
        </Card>

        <ShareActions
          card={{
            emoji: "🍀",
            badge: `${result.targetYear} 신년운세 · ${result.grade}`,
            title: result.oneLine,
            subtitle: result.profile.nicknameShort,
            lines: [
              `🏷️ ${result.keyThemes.map((t) => `#${t}`).join(" ")}`,
              `🌟 기회 · ${result.opportunities[0]}`,
              `🚧 조심 · ${result.cautions[0]}`,
            ],
            theme: "mint",
          }}
          message={`🍀 내 ${result.targetYear}년 운세는 "${result.grade}"!\n키워드: ${result.keyThemes.join(", ")}`}
        />

        <ResultFooter />
        <BottomCTA label="다시 보기" onClick={() => setResult(null)} />
      </>
    );
  }

  return (
    <>
      <TopBar title="신년운세" onBack={onBack} />
      <div className="page-intro theme-year">
        <MascotSay emoji="🍀">올해는 어떤 일이 생길까? 같이 살짝 엿보자!</MascotSay>
        <h2 className="page-intro-title">
          한 해의 흐름을
          <br />
          미리 살펴볼까요? 🗓️
        </h2>
        <p className="page-intro-desc">키워드, 기회와 주의할 점, 대운 흐름을 알려드려요.</p>
      </div>

      <div className="form">
        <div className="field">
          <span className="field-label">운세 볼 연도</span>
          <div className="segmented" role="radiogroup">
            {[THIS_YEAR, THIS_YEAR + 1].map((year) => (
              <button
                key={year}
                type="button"
                role="radio"
                aria-checked={targetYear === year}
                className={targetYear === year ? "segmented-item is-active" : "segmented-item"}
                onClick={() => setTargetYear(year)}
              >
                {year}년
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="error-box" role="alert">{error}</p>}
      <BirthForm value={input} onChange={setInput} />
      <BottomCTA label="신년운세 보기" disabled={!isBirthValid(input)} onClick={submit} />
    </>
  );
}
