import { useState } from "react";
import { collectCharacter } from "../activity";
import { analyzeSaju, characterFrom, todayString } from "../api";
import { EMPTY_BIRTH, isBirthValid } from "../birth";
import { BirthForm } from "../components/BirthForm";
import { BottomCTA, Card, InfoRow, Loading, MascotSay, ResultFooter, ShareActions, TopBar } from "../components/ui";
import type { BirthInput, SajuResult } from "../types";

export function SajuScreen({ onBack, initial }: { onBack: () => void; initial?: BirthInput | null }) {
  const [input, setInput] = useState<BirthInput>(initial ?? EMPTY_BIRTH);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SajuResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await analyzeSaju(input);
      setResult(r);
      const character = characterFrom(r.profile.nicknameShort, r.typeSummary);
      if (character) collectCharacter({ ...character, source: "me", date: todayString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "운세를 불러오지 못했어요");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="내 사주 분석" onBack={onBack} />
        <Loading text="호(虎)가 사주를 읽고 있어요" />
      </>
    );
  }

  if (result) {
    return (
      <>
        <TopBar title="내 사주 분석" onBack={() => setResult(null)} />
        <div className="result-hero theme-saju">
          <span className="result-sticker" aria-hidden="true">
            🔮
          </span>
          <p className="result-eyebrow">{result.profile.nicknameShort}</p>
          <h2 className="result-title">{result.typeSummary}</h2>
        </div>

        <Card title={result.elements ? "오행 분포" : "오행 균형"} eyebrow="FIVE ELEMENTS">
          {result.elements && (
          <ul className="element-chart" aria-label="사주 여덟 글자의 오행 분포">
            {result.elements.map((e) => (
              <li key={e.name} className="element-col" data-element={e.hanja}>
                <span className="element-count">{e.count}</span>
                <span className="element-bar">
                  <span className="element-fill" style={{ height: `${(e.count / 4) * 100}%` }} />
                </span>
                <span className="element-name">
                  {e.hanja}
                  <small>{e.name}</small>
                </span>
              </li>
            ))}
          </ul>
          )}
          <p className="card-text">{result.elementTendency}</p>
          <p className="hint-box">
            <strong className="hint-label">보완 팁</strong>
            {result.supplementHint}
          </p>
        </Card>

        <Card title="성격과 기질" eyebrow="PERSONALITY">
          <dl className="info-list">
            <InfoRow label="첫인상">{result.personality.firstImpression}</InfoRow>
            <InfoRow label="속마음">{result.personality.coreTrait}</InfoRow>
            <InfoRow label="강점">{result.personality.strengths}</InfoRow>
          </dl>
        </Card>

        <Card title="삶의 방향" eyebrow="LIFE GUIDE">
          <dl className="info-list">
            <InfoRow label="직업">{result.lifeHints.career}</InfoRow>
            <InfoRow label="관계">{result.lifeHints.relationship}</InfoRow>
            <InfoRow label="건강">{result.lifeHints.health}</InfoRow>
          </dl>
        </Card>

        <ShareActions
          card={{
            emoji: "🔮",
            badge: "내 사주 캐릭터",
            title: result.profile.nicknameShort,
            subtitle: result.typeSummary,
            lines: [
              `✨ 첫인상 · ${result.personality.firstImpression}`,
              `💼 잘 맞는 일 · ${result.lifeHints.career.split(",")[0]}`,
              `🍀 ${result.supplementHint.split(",")[0]}`,
            ],
            theme: "lavender",
          }}
          message={`🔮 내 사주 캐릭터는 "${result.profile.nicknameShort}"래요!\n${result.typeSummary}`}
        />

        <ResultFooter />
        <BottomCTA label="다시 보기" onClick={() => setResult(null)} />
      </>
    );
  }

  return (
    <>
      <TopBar title="내 사주 분석" onBack={onBack} />
      <div className="page-intro theme-saju">
        <MascotSay emoji="🔮">태어난 날만 알려주면 내가 다 읽어줄게!</MascotSay>
        <h2 className="page-intro-title">
          태어난 날을
          <br />
          알려주세요 🌸
        </h2>
        <p className="page-intro-desc">오행, 성격, 강점과 삶의 방향을 알려드려요.</p>
      </div>
      {error && <p className="error-box" role="alert">{error}</p>}
      <BirthForm value={input} onChange={setInput} />
      <BottomCTA label="사주 분석하기" disabled={!isBirthValid(input)} onClick={submit} />
    </>
  );
}
