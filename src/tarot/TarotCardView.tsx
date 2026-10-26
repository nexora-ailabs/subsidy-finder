import { useEffect, useRef, useState, type CSSProperties } from "react";
import { haptic } from "../platform";
import type { DrawnCard } from "./cards";

// 사용자가 보는 앞에서 카드가 뒤집혔을 때만 반짝이를 터뜨린다.
// 저장된 상태를 불러와 처음부터 뒤집힌 채로 나타나는 경우(카드가 없던 상태에서 바로 뒤집힘)는 제외한다.
function useFlipBurst(flipped: boolean, hasCard: boolean) {
  const prev = useRef({ flipped, hasCard });
  const [burst, setBurst] = useState(false);
  useEffect(() => {
    const was = prev.current;
    prev.current = { flipped, hasCard };
    if (!flipped || was.flipped || !was.hasCard) return;
    setBurst(true);
    haptic("success");
    const t = window.setTimeout(() => setBurst(false), 1100);
    return () => window.clearTimeout(t);
  }, [flipped, hasCard]);
  return burst;
}

const BURST = ["✦", "✧", "♡", "✦", "✧", "★", "✦", "♡"];

interface TarotCardViewProps {
  drawn: DrawnCard | null;
  flipped: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  label?: string;
}

// 앞면은 숫자·심볼·이름, 뒷면은 공통 무늬. flipped가 되면 3D로 뒤집힌다.
export function TarotCardView({ drawn, flipped, size = "md", onClick, label }: TarotCardViewProps) {
  const burst = useFlipBurst(flipped, drawn !== null);
  const className = `tarot ${`tarot-${size}`}${flipped ? " is-flipped" : ""}${onClick ? " is-clickable" : ""}`;
  const content = (
    <>
      <span className="tarot-inner">
        <span className="tarot-face tarot-back" aria-hidden={flipped}>
          <span className="tarot-back-frame">
            <span className="tarot-back-star">✦</span>
            <span className="tarot-back-moon">☾</span>
          </span>
        </span>
        <span className="tarot-face tarot-front" aria-hidden={!flipped}>
          {drawn && (
            <span className={drawn.reversed ? "tarot-front-body is-reversed" : "tarot-front-body"}>
              <span className="tarot-numeral">{drawn.card.numeral}</span>
              <span className="tarot-symbol">{drawn.card.symbol}</span>
              <span className="tarot-name">{drawn.card.nameKo}</span>
              <span className="tarot-name-en">{drawn.card.nameEn}</span>
            </span>
          )}
        </span>
      </span>
      {burst && (
        <span className="tarot-burst" aria-hidden="true">
          {BURST.map((s, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>
              {s}
            </span>
          ))}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        aria-label={label ?? (flipped && drawn ? `${drawn.card.nameKo} 카드` : "카드 뒤집기")}
      >
        {content}
      </button>
    );
  }
  return (
    <span className={className} role="img" aria-label={flipped && drawn ? `${drawn.card.nameKo} 카드` : "뒷면 카드"}>
      {content}
    </span>
  );
}
