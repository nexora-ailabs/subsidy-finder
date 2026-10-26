import { useState } from "react";
import { EMPTY_BIRTH, isBirthValid } from "../birth";
import { BirthForm } from "../components/BirthForm";
import { BottomCTA, Card, Chips, InfoRow, Loading, MascotSay, ResultFooter, ShareActions, TopBar } from "../components/ui";
import { getLoveFortune, type LoveFortuneResult } from "../extra";
import type { BirthInput } from "../types";
import { Hearts } from "./DailyScreen";

export function LoveScreen({ onBack, onCompat, initial }: { onBack: () => void; onCompat: () => void; initial?: BirthInput | null }) {
  const [input, setInput] = useState<BirthInput>(initial ?? EMPTY_BIRTH);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoveFortuneResult | null>(null);

  const submit = async () => {
    setLoading(true);
    try {
      setResult(await getLoveFortune(input));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="연애운" onBack={onBack} />
        <Loading text="사랑의 기운을 읽고 있어요" />
      </>
    );
  }

  if (result) {
    return (
      <>
        <TopBar title="연애운" onBack={() => setResult(null)} />
        <div className="result-hero is-center theme-compat">
          <span className="result-sticker" aria-hidden="true">
            💘
          </span>
          <p className="result-eyebrow">{result.profile.nicknameShort} · 이번 달 연애운</p>
          <Hearts score={result.score} />
          <h2 className="result-title">{result.title}</h2>
          <p className="result-desc">{result.message}</p>
        </div>

        <Card title="이번 달 흐름" eyebrow="THIS MONTH">
          <p className="card-text">{result.monthFlow}</p>
        </Card>

        <Card title="지금 나에게" eyebrow="FOR YOU">
          <dl className="info-list">
            <InfoRow label="솔로라면">{result.single}</InfoRow>
            <InfoRow label="연애 중이라면">{result.couple}</InfoRow>
          </dl>
        </Card>

        <Card title="잘 맞는 사람" eyebrow="IDEAL TYPE">
          <Chips items={result.idealType} />
        </Card>

        <Card title="행운의 데이트" eyebrow="LUCKY DATE">
          <dl className="info-list">
            <InfoRow label="장소">{result.luckySpot}</InfoRow>
            <InfoRow label="요일">{result.luckyDay}</InfoRow>
          </dl>
        </Card>

        <Card title="연애 팁" eyebrow="TIPS">
          <ul className="bullet-list">
            {result.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="hint-box">
            <strong className="hint-label">조심하세요</strong>
            {result.caution}
          </p>
        </Card>

        <ShareActions
          card={{
            emoji: "💘",
            badge: "이번 달 연애운",
            title: result.title,
            subtitle: result.profile.nicknameShort,
            lines: [`💕 ${"♥".repeat(result.score)}${"♡".repeat(5 - result.score)}`, `📍 행운의 장소 · ${result.luckySpot}`, `📅 행운의 요일 · ${result.luckyDay}`],
            theme: "pink",
          }}
          message={`💘 내 이번 달 연애운: ${result.title}\n행운의 데이트 장소는 ${result.luckySpot}!`}
        />

        <button type="button" className="text-link" onClick={onCompat}>
          그 사람과 궁합도 볼래요 →
        </button>

        <ResultFooter sample />
        <BottomCTA label="다시 보기" onClick={() => setResult(null)} />
      </>
    );
  }

  return (
    <>
      <TopBar title="연애운" onBack={onBack} />
      <div className="page-intro theme-compat">
        <MascotSay emoji="💘">요즘 마음이 콩닥콩닥? 이번 달 연애운을 봐줄게!</MascotSay>
        <p className="section-eyebrow">LOVE</p>
        <h2 className="page-intro-title">이번 달 나의 연애운</h2>
        <p className="page-intro-desc">연애 흐름, 잘 맞는 사람, 행운의 데이트를 알려드려요.</p>
      </div>
      <BirthForm value={input} onChange={setInput} showCity={false} />
      <BottomCTA label="연애운 보기" disabled={!isBirthValid(input)} onClick={submit} />
    </>
  );
}
