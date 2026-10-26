import { useState } from "react";
import { EMPTY_BIRTH, isBirthValid } from "../birth";
import { BirthForm } from "../components/BirthForm";
import { BottomCTA, Card, Loading, MascotSay, ResultFooter, TopBar } from "../components/ui";
import { getDaeun, type DaeunResult } from "../extra";
import type { BirthInput } from "../types";

export function DaeunScreen({ onBack, initial }: { onBack: () => void; initial?: BirthInput | null }) {
  const [input, setInput] = useState<BirthInput>(initial ?? EMPTY_BIRTH);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DaeunResult | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const submit = async () => {
    setLoading(true);
    try {
      const r = await getDaeun(input);
      setResult(r);
      setOpen(r.currentIndex);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="대운" onBack={onBack} />
        <Loading text="10년 단위의 큰 흐름을 읽고 있어요" />
      </>
    );
  }

  if (result) {
    const current = result.cycles[result.currentIndex];
    return (
      <>
        <TopBar title="대운" onBack={() => setResult(null)} />
        <div className="result-hero theme-daeun">
          <span className="result-sticker" aria-hidden="true">
            🌊
          </span>
          <p className="result-eyebrow">
            {result.profile.nicknameShort} · 지금 {result.koreanAge}세
          </p>
          <h2 className="result-title">
            지금은 {current.gapja} 대운,
            <br />
            &lsquo;{current.theme}&rsquo;의 시기예요
          </h2>
          <p className="result-desc">{current.desc}</p>
        </div>

        <Card title="인생의 큰 흐름" eyebrow="10-YEAR CYCLES">
          <div className="daeun-chart" aria-label="대운별 운세 그래프">
            {result.cycles.map((c, i) => (
              <button
                key={c.startAge}
                type="button"
                className={["daeun-bar", i === result.currentIndex ? "is-current" : "", i === open ? "is-open" : ""].join(" ")}
                onClick={() => setOpen(i)}
                aria-label={`${c.startAge}세 ${c.gapja} 대운, 5점 만점에 ${c.score}점`}
              >
                <span className="daeun-fill" style={{ height: `${c.score * 20}%` }} data-element={c.hanja} />
                <span className="daeun-age">{c.startAge}</span>
              </button>
            ))}
          </div>
          <p className="cal-legend">막대를 누르면 그 시기의 해석을 볼 수 있어요</p>
        </Card>

        <ol className="daeun-list">
          {result.cycles.map((c, i) => (
            <li key={c.startAge} className={["daeun-item", i === result.currentIndex ? "is-current" : "", i === open ? "is-open" : ""].join(" ")}>
              <button type="button" className="daeun-head" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                <span className="daeun-gapja" data-element={c.hanja}>
                  {c.gapja}
                </span>
                <span className="menu-text">
                  <span className="daeun-range">
                    {c.startAge}~{c.endAge}세{i === result.currentIndex && <span className="menu-tag">지금</span>}
                  </span>
                  <span className="menu-desc">{c.theme}</span>
                </span>
                <span className="month-score">
                  {"♥".repeat(c.score)}
                  <span className="muted">{"♡".repeat(5 - c.score)}</span>
                </span>
              </button>
              {open === i && <p className="daeun-desc">{c.desc}</p>}
            </li>
          ))}
        </ol>

        <ResultFooter sample />
        <BottomCTA label="다시 보기" onClick={() => setResult(null)} />
      </>
    );
  }

  return (
    <>
      <TopBar title="대운" onBack={onBack} />
      <div className="page-intro theme-daeun">
        <MascotSay emoji="🌊">인생은 10년마다 큰 물결이 바뀐대. 지금은 어떤 물결일까?</MascotSay>
        <p className="section-eyebrow">DAEUN</p>
        <h2 className="page-intro-title">10년 단위로 보는 인생의 흐름</h2>
        <p className="page-intro-desc">지금 대운과 앞으로의 흐름을 한눈에 보여드려요.</p>
      </div>
      <BirthForm value={input} onChange={setInput} />
      <BottomCTA label="대운 보기" disabled={!isBirthValid(input)} onClick={submit} />
    </>
  );
}
