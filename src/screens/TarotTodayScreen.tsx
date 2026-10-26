import { BottomCTA, Card, Chips, ResultFooter, ShareActions, TopBar } from "../components/ui";
import { TarotCardView } from "../tarot/TarotCardView";
import { useTodayTarot } from "../tarot/useTodayTarot";
import type { BirthInput } from "../types";

interface TarotTodayScreenProps {
  profile: BirthInput | null;
  ready: boolean;
  onBack: () => void;
  onOpenSpread: () => void;
}

export function TarotTodayScreen({ profile, ready, onBack, onOpenSpread }: TarotTodayScreenProps) {
  const { drawn, flipped, flip } = useTodayTarot(profile, ready);

  return (
    <>
      <TopBar title="오늘의 타로" onBack={onBack} />

      <div className="tarot-stage">
        <p className="section-eyebrow">TODAY'S CARD</p>
        <h2 className="page-intro-title is-center">
          {flipped && drawn ? (
            <>
              {drawn.card.nameKo}
              <span className="tarot-orientation">{drawn.reversed ? "역방향" : "정방향"}</span>
            </>
          ) : (
            "오늘의 한 장을 뽑아보세요"
          )}
        </h2>
        <TarotCardView drawn={drawn} flipped={flipped} size="lg" onClick={flipped ? undefined : flip} />
        {!flipped && <p className="tarot-hint">카드를 눌러 뒤집어 보세요 · 하루에 한 장만 뽑을 수 있어요</p>}
      </div>

      {flipped && drawn && (
        <>
          <Card title="키워드" eyebrow="KEYWORDS">
            <Chips items={drawn.card.keywords.map((k) => `# ${k}`)} />
          </Card>

          <Card title="오늘의 메시지" eyebrow="MESSAGE">
            <p className="card-text">{drawn.reversed ? drawn.card.reversed : drawn.card.upright.general}</p>
          </Card>

          {!drawn.reversed && (
            <Card title="분야별 해석" eyebrow="READING">
              <dl className="reading-list">
                <div className="reading-row">
                  <dt>연애</dt>
                  <dd>{drawn.card.upright.love}</dd>
                </div>
                <div className="reading-row">
                  <dt>일·학업</dt>
                  <dd>{drawn.card.upright.work}</dd>
                </div>
                <div className="reading-row">
                  <dt>금전</dt>
                  <dd>{drawn.card.upright.money}</dd>
                </div>
              </dl>
            </Card>
          )}

          <Card title="오늘의 조언" eyebrow="ADVICE">
            <p className="hint-box">{drawn.card.advice}</p>
          </Card>

          <ShareActions
            card={{
              emoji: "🃏",
              badge: "오늘의 타로",
              title: `${drawn.card.nameKo} ${drawn.reversed ? "(역방향)" : ""}`.trim(),
              subtitle: drawn.card.nameEn,
              lines: [drawn.card.keywords.map((k) => `#${k}`).join(" "), `💌 ${drawn.card.advice}`],
              theme: "lavender",
            }}
            message={`🃏 오늘 내가 뽑은 타로는 "${drawn.card.nameKo}" 카드!\n${drawn.card.advice}`}
          />

          <button type="button" className="text-link" onClick={onOpenSpread}>
            고민이 있다면 3장 타로로 더 자세히 보기 →
          </button>

          <ResultFooter />
        </>
      )}

      <BottomCTA label={flipped ? "홈으로" : "카드 뒤집기"} onClick={flipped ? onBack : flip} disabled={!drawn} />
    </>
  );
}
