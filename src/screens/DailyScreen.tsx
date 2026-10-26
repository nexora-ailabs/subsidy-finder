import { useEffect, useState } from "react";
import { recordFortune } from "../activity";
import { getDailyFortune } from "../api";
import { EMPTY_BIRTH, isBirthValid } from "../birth";
import { BirthForm } from "../components/BirthForm";
import { BottomCTA, Card, Loading, MascotSay, ResultFooter, ShareActions, TopBar } from "../components/ui";
import type { BirthInput, DailyFortuneResult } from "../types";

export function Hearts({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  return (
    <span className={`hearts hearts-${size}`} aria-label={`5점 만점에 ${score}점`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < score ? "heart is-on" : "heart"} aria-hidden="true">
          {i < score ? "💗" : "🤍"}
        </span>
      ))}
    </span>
  );
}

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}

interface DailyScreenProps {
  profile: BirthInput | null;
  onSaveProfile: (input: BirthInput) => Promise<void>;
  onBack: () => void;
  onEditProfile: () => void;
}

export function DailyScreen({ profile, onSaveProfile, onBack, onEditProfile }: DailyScreenProps) {
  const [input, setInput] = useState<BirthInput>(EMPTY_BIRTH);
  const [result, setResult] = useState<DailyFortuneResult | null>(null);

  useEffect(() => {
    if (!profile) return;
    let alive = true;
    getDailyFortune(profile).then((r) => {
      recordFortune(r.date, { score: r.score, title: r.title });
      if (alive) setResult(r);
    });
    return () => {
      alive = false;
    };
  }, [profile]);

  if (!profile) {
    return (
      <>
        <TopBar title="오늘의 운세" onBack={onBack} />
        <div className="page-intro theme-daily">
          <MascotSay emoji="🌤️">한 번만 알려주면 매일 아침 운세를 바로 보여줄게!</MascotSay>
          <h2 className="page-intro-title">
            내 정보를 등록하고
            <br />
            매일 운세 받아보세요 💌
          </h2>
          <p className="page-intro-desc">입력한 정보는 이 기기에만 저장돼요.</p>
        </div>
        <BirthForm value={input} onChange={setInput} />
        <BottomCTA label="저장하고 오늘 운세 보기" disabled={!isBirthValid(input)} onClick={() => onSaveProfile(input)} />
      </>
    );
  }

  if (!result) {
    return (
      <>
        <TopBar title="오늘의 운세" onBack={onBack} />
        <Loading text="오늘의 기운을 읽고 있어요" />
      </>
    );
  }

  const shareLines = [
    `💗 오늘의 점수 ${"♥".repeat(result.score)}${"♡".repeat(5 - result.score)}`,
    `🎨 행운의 색 · ${result.lucky.color}`,
    `🔢 행운의 숫자 · ${result.lucky.number}`,
    `🍓 행운의 음식 · ${result.lucky.food}`,
  ];

  return (
    <>
      <TopBar title="오늘의 운세" onBack={onBack} />
      <div className="result-hero is-center theme-daily">
        <p className="result-eyebrow">
          📅 {formatDate(result.date)} · {result.dayGapja}
        </p>
        <span className="result-sticker" aria-hidden="true">
          🌤️
        </span>
        <Hearts score={result.score} />
        <h2 className="result-title">{result.title}</h2>
        <p className="result-desc">{result.message}</p>
      </div>

      <Card title="분야별 운세" eyebrow="BY CATEGORY">
        <ul className="score-list">
          {result.categories.map((c) => (
            <li key={c.key} className="score-row">
              <span className="score-label">
                {c.emoji} {c.label}
              </span>
              <span className="score-bar" aria-hidden="true">
                <span className="score-fill" style={{ width: `${c.score * 20}%` }} />
              </span>
              <span className="score-num">{c.score}/5</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="오늘의 행운" eyebrow="LUCKY ITEMS">
        <div className="lucky-grid">
          <div className="lucky-item">
            <span className="lucky-swatch" style={{ background: result.lucky.colorHex }} aria-hidden="true" />
            <span className="lucky-label">행운의 색</span>
            <span className="lucky-value">{result.lucky.color}</span>
          </div>
          <div className="lucky-item">
            <span className="lucky-emoji" aria-hidden="true">
              🔢
            </span>
            <span className="lucky-label">행운의 숫자</span>
            <span className="lucky-value">{result.lucky.number}</span>
          </div>
          <div className="lucky-item">
            <span className="lucky-emoji" aria-hidden="true">
              🧭
            </span>
            <span className="lucky-label">행운의 방향</span>
            <span className="lucky-value">{result.lucky.direction}</span>
          </div>
          <div className="lucky-item">
            <span className="lucky-emoji" aria-hidden="true">
              🎀
            </span>
            <span className="lucky-label">행운의 아이템</span>
            <span className="lucky-value">{result.lucky.item}</span>
          </div>
          <div className="lucky-item">
            <span className="lucky-emoji" aria-hidden="true">
              🍓
            </span>
            <span className="lucky-label">행운의 음식</span>
            <span className="lucky-value">{result.lucky.food}</span>
          </div>
          <div className="lucky-item">
            <span className="lucky-emoji" aria-hidden="true">
              ⏰
            </span>
            <span className="lucky-label">조심할 시간</span>
            <span className="lucky-value">{result.cautionTime}</span>
          </div>
        </div>
      </Card>

      <Card>
        <p className="one-line-label">💌 호가 전하는 오늘의 한마디</p>
        <p className="one-line">“{result.advice}”</p>
      </Card>

      <ShareActions
        card={{
          emoji: "🌤️",
          badge: `${formatDate(result.date)} 오늘의 운세`,
          title: result.title,
          subtitle: result.profile.nicknameShort,
          lines: shareLines,
        }}
        message={`🌤️ ${formatDate(result.date)} 내 오늘의 운세: ${result.title}\n행운의 색은 ${result.lucky.color}, 행운의 숫자는 ${result.lucky.number}!`}
      />

      <button type="button" className="text-link" onClick={onEditProfile}>
        ✏️ 내 정보 수정하기
      </button>

      <ResultFooter />
      <BottomCTA label="홈으로" onClick={onBack} />
    </>
  );
}
