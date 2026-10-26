import { useMemo, useState, type CSSProperties } from "react";
import { haptic } from "../platform";
import { BottomCTA, Card, LockedSection, MascotSay, ResultFooter, ShareActions, TopBar } from "../components/ui";
import { readingText, type DrawnCard, type TarotTopic } from "../tarot/cards";
import { shuffledDeck } from "../tarot/draw";
import { TarotCardView } from "../tarot/TarotCardView";

const TOPICS: { key: TarotTopic; label: string; emoji: string; desc: string }[] = [
  { key: "love", label: "연애", emoji: "💕", desc: "그 사람의 마음, 우리 관계의 흐름" },
  { key: "work", label: "일·학업", emoji: "📚", desc: "이직, 시험, 프로젝트의 방향" },
  { key: "money", label: "금전", emoji: "💰", desc: "지출과 수입, 재테크 고민" },
  { key: "general", label: "오늘의 고민", emoji: "💭", desc: "마음속 어떤 질문이든" },
];

const POSITIONS = ["과거", "현재", "미래"] as const;

type Step = "topic" | "pick" | "reveal";

function summarize(cards: DrawnCard[]): string {
  const reversed = cards.filter((c) => c.reversed).length;
  if (reversed === 0) return "세 장 모두 정방향이에요. 흐름이 순조롭게 이어지고 있으니 지금의 방향을 믿고 나아가세요.";
  if (reversed === 1) return "대체로 좋은 흐름 속에 살펴볼 부분이 하나 있어요. 역방향 카드의 메시지를 특히 기억해 두세요.";
  if (reversed === 2) return "지금은 속도를 늦추고 점검이 필요한 때예요. 서두르기보다 정리하는 데 힘을 쓰세요.";
  return "세 장 모두 역방향이에요. 잠시 멈춰서 나를 돌보는 것이 가장 좋은 답이에요.";
}

export function TarotSpreadScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState<TarotTopic>("love");
  const [deck, setDeck] = useState<DrawnCard[]>(() => shuffledDeck());
  const [picked, setPicked] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);

  const chosen = useMemo(() => picked.map((i) => deck[i]), [picked, deck]);
  const topicInfo = TOPICS.find((t) => t.key === topic)!;
  const allRevealed = revealed.every(Boolean);

  const restart = () => {
    setDeck(shuffledDeck());
    setPicked([]);
    setRevealed([false, false, false]);
    setStep("topic");
  };

  const togglePick = (index: number) => {
    haptic("tap");
    setPicked((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : prev.length < 3 ? [...prev, index] : prev));
  };

  if (step === "topic") {
    return (
      <>
        <TopBar title="고민 타로" onBack={onBack} />
        <div className="page-intro theme-tarot">
          <MascotSay emoji="🔮">마음속 질문을 하나 떠올리고 주제를 골라줘!</MascotSay>
          <p className="section-eyebrow">THREE CARD SPREAD</p>
          <h2 className="page-intro-title">어떤 고민이 있나요?</h2>
          <p className="page-intro-desc">과거 · 현재 · 미래 세 장으로 흐름을 읽어드려요.</p>
        </div>
        <div className="topic-list" role="radiogroup">
          {TOPICS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={topic === t.key}
              className={topic === t.key ? "topic-item is-active" : "topic-item"}
              onClick={() => {
                haptic("tickWeak");
                setTopic(t.key);
              }}
            >
              <span className="topic-emoji" aria-hidden="true">
                {t.emoji}
              </span>
              <span className="menu-text">
                <span className="topic-label">{t.label}</span>
                <span className="menu-desc">{t.desc}</span>
              </span>
              <span className="topic-check" aria-hidden="true" />
            </button>
          ))}
        </div>
        <BottomCTA label="카드 섞기" onClick={() => setStep("pick")} />
      </>
    );
  }

  if (step === "pick") {
    return (
      <>
        <TopBar title="고민 타로" onBack={() => setStep("topic")} />
        <div className="page-intro theme-tarot">
          <p className="section-eyebrow">
            {topicInfo.emoji} {topicInfo.label}
          </p>
          <h2 className="page-intro-title">마음이 가는 카드 3장을 골라주세요</h2>
          <p className="page-intro-desc">
            질문을 떠올리며 천천히 골라보세요 · <strong className="pick-count">{picked.length} / 3</strong>
          </p>
        </div>
        <div className="deck-grid">
          {deck.map((_, i) => {
            const order = picked.indexOf(i);
            return (
              <button
                key={i}
                type="button"
                className={order >= 0 ? "deck-card is-picked" : "deck-card"}
                style={{ "--i": i } as CSSProperties}
                onClick={() => togglePick(i)}
                aria-label={order >= 0 ? `${order + 1}번째로 고른 카드` : `${i + 1}번 카드 고르기`}
                aria-pressed={order >= 0}
              >
                <TarotCardView drawn={null} flipped={false} size="sm" />
                {order >= 0 && <span className="deck-order">{POSITIONS[order]}</span>}
              </button>
            );
          })}
        </div>
        <BottomCTA label={picked.length === 3 ? "카드 펼치기" : `${3 - picked.length}장 더 골라주세요`} disabled={picked.length < 3} onClick={() => setStep("reveal")} />
      </>
    );
  }

  return (
    <>
      <TopBar title="고민 타로" onBack={restart} />
      <div className="page-intro theme-tarot">
        <p className="section-eyebrow">
          {topicInfo.emoji} {topicInfo.label} · THREE CARD SPREAD
        </p>
        <h2 className="page-intro-title">{allRevealed ? "카드가 전하는 이야기" : "카드를 한 장씩 뒤집어 보세요"}</h2>
      </div>

      <div className="spread">
        {chosen.map((drawn, i) => (
          <div key={drawn.card.id} className="spread-slot">
            <span className="spread-position">{POSITIONS[i]}</span>
            <TarotCardView
              drawn={drawn}
              flipped={revealed[i]}
              size="md"
              onClick={revealed[i] ? undefined : () => setRevealed((r) => r.map((v, j) => (j === i ? true : v)))}
            />
            {revealed[i] && <span className="spread-name">{drawn.reversed ? <small>역방향</small> : "정방향"}</span>}
          </div>
        ))}
      </div>

      {allRevealed && (
        <>
          {chosen.map((drawn, i) => (
            <Card key={drawn.card.id} title={`${drawn.card.nameKo}${drawn.reversed ? " (역방향)" : ""}`} eyebrow={`${POSITIONS[i]} · ${drawn.card.nameEn}`}>
              <p className="card-text">{readingText(drawn, topic)}</p>
            </Card>
          ))}

          <Card title="종합 해석" eyebrow="SUMMARY">
            <p className="card-text">{summarize(chosen)}</p>
            <p className="hint-box">{chosen[2].card.advice}</p>
          </Card>

          <LockedSection title="카드별 심층 해석" eyebrow="DEEP READING" preview="과거 카드의 키워드는 직관과 내면이에요. 현재 카드가 말하는 조언은… 미래로 가는 길에서 조심할 점은…">
            <dl className="reading-list">
              {chosen.map((drawn, i) => (
                <div key={drawn.card.id} className="reading-row">
                  <dt>
                    {POSITIONS[i]} · {drawn.card.nameKo}
                  </dt>
                  <dd>
                    <span className="deep-keywords">{drawn.card.keywords.map((k) => `#${k}`).join(" ")}</span>
                    <br />
                    조언: {drawn.card.advice}
                    <br />
                    <span className="muted">주의: {drawn.card.reversed}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </LockedSection>

          <ShareActions
            card={{
              emoji: "🔮",
              badge: `${topicInfo.label} 타로`,
              title: chosen.map((c) => c.card.nameKo).join(" · "),
              subtitle: "과거 · 현재 · 미래",
              lines: [summarize(chosen).split(".")[0] + ".", `💌 ${chosen[2].card.advice}`],
              theme: "lavender",
            }}
            message={`🔮 내 ${topicInfo.label} 타로: ${chosen.map((c) => c.card.nameKo).join(" → ")}\n${chosen[2].card.advice}`}
          />
          <ResultFooter />
        </>
      )}

      <BottomCTA
        label={allRevealed ? "다른 고민 보기" : "모두 뒤집기"}
        onClick={allRevealed ? restart : () => setRevealed([true, true, true])}
      />
    </>
  );
}
