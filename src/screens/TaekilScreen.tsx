import { useState } from "react";
import { EMPTY_BIRTH, isBirthValid } from "../birth";
import { BirthForm } from "../components/BirthForm";
import { BottomCTA, Card, Loading, MascotSay, ResultFooter, TopBar } from "../components/ui";
import { getGoodDays, TAEKIL_PURPOSES, type TaekilPurpose, type TaekilResult } from "../extra";
import { haptic } from "../platform";
import type { BirthInput } from "../types";

// 이번 달부터 3개월 중에서 고른다
function upcomingMonths(): { year: number; month: number }[] {
  const now = new Date();
  return [0, 1, 2].map((i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
}

export function TaekilScreen({ onBack, initial }: { onBack: () => void; initial?: BirthInput | null }) {
  const [input, setInput] = useState<BirthInput>(initial ?? EMPTY_BIRTH);
  const [purpose, setPurpose] = useState<TaekilPurpose>("date");
  const [months] = useState(upcomingMonths);
  const [monthIndex, setMonthIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaekilResult | null>(null);

  const purposeInfo = TAEKIL_PURPOSES.find((p) => p.key === purpose)!;

  const submit = async () => {
    setLoading(true);
    try {
      const { year, month } = months[monthIndex];
      setResult(await getGoodDays(input, purpose, year, month));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="택일" onBack={onBack} />
        <Loading text="좋은 날을 고르고 있어요" />
      </>
    );
  }

  if (result) {
    return (
      <>
        <TopBar title="택일" onBack={() => setResult(null)} />
        <div className="result-hero theme-year">
          <span className="result-sticker" aria-hidden="true">
            {purposeInfo.emoji}
          </span>
          <p className="result-eyebrow">
            {result.year}년 {result.month}월 · {purposeInfo.label}
          </p>
          <h2 className="result-title">
            {purposeInfo.label}하기 좋은 날
            <br />
            {result.good.length}일을 골랐어요
          </h2>
        </div>

        <Card title="추천하는 날" eyebrow="GOOD DAYS">
          {result.good.length === 0 ? (
            <p className="card-text muted">이번 달은 남은 날이 없어요. 다음 달을 골라 보세요.</p>
          ) : (
            <ul className="day-list">
              {result.good.map((d) => (
                <li key={d.date} className="day-row">
                  <span className="day-date">
                    <strong>{Number(d.date.slice(8))}</strong>
                    <small>{d.weekday}</small>
                  </span>
                  <span className="menu-text">
                    <span className="day-reason">{d.reason}</span>
                    <span className="menu-desc">{d.gapja}일</span>
                  </span>
                  <span className={d.grade === "대길" ? "day-grade is-best" : "day-grade"}>{d.grade}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {result.avoid.length > 0 && (
          <Card title="피하면 좋은 날" eyebrow="AVOID">
            <ul className="day-list">
              {result.avoid.map((d) => (
                <li key={d.date} className="day-row is-avoid">
                  <span className="day-date">
                    <strong>{Number(d.date.slice(8))}</strong>
                    <small>{d.weekday}</small>
                  </span>
                  <span className="menu-text">
                    <span className="day-reason">{d.reason}</span>
                    <span className="menu-desc">{d.gapja}일</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <ResultFooter sample />
        <BottomCTA label="다른 날짜 보기" onClick={() => setResult(null)} />
      </>
    );
  }

  return (
    <>
      <TopBar title="택일" onBack={onBack} />
      <div className="page-intro theme-year">
        <MascotSay emoji="📅">중요한 날, 언제가 좋을지 같이 골라보자!</MascotSay>
        <p className="section-eyebrow">TAEKIL</p>
        <h2 className="page-intro-title">나에게 좋은 날 고르기</h2>
        <p className="page-intro-desc">내 사주와 날짜의 기운을 맞춰 좋은 날을 추천해 드려요.</p>
      </div>

      <div className="form">
        <div className="field">
          <span className="field-label">어떤 날을 고를까요?</span>
          <div className="purpose-grid" role="radiogroup">
            {TAEKIL_PURPOSES.map((p) => (
              <button
                key={p.key}
                type="button"
                role="radio"
                aria-checked={purpose === p.key}
                className={purpose === p.key ? "purpose-item is-active" : "purpose-item"}
                onClick={() => {
                  haptic("tickWeak");
                  setPurpose(p.key);
                }}
              >
                <span aria-hidden="true">{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">언제쯤인가요?</span>
          <div className="segmented" role="radiogroup">
            {months.map((m, i) => (
              <button
                key={`${m.year}-${m.month}`}
                type="button"
                role="radio"
                aria-checked={monthIndex === i}
                className={monthIndex === i ? "segmented-item is-active" : "segmented-item"}
                onClick={() => setMonthIndex(i)}
              >
                {m.month}월
              </button>
            ))}
          </div>
        </div>
      </div>

      <BirthForm value={input} onChange={setInput} showCity={false} />
      <BottomCTA label="좋은 날 찾기" disabled={!isBirthValid(input)} onClick={submit} />
    </>
  );
}
