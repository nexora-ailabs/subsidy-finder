import { useState, type ReactNode } from "react";
import { IS_MOCK } from "../api";
import { createAppLink, haptic, saveImage, shareMessage, showRewardedAd } from "../platform";
import { renderShareCard, type ShareCardContent } from "../shareCard";

export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="topbar">
      <button type="button" className="topbar-back" onClick={onBack} aria-label="뒤로 가기">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 className="topbar-title">{title}</h1>
    </header>
  );
}

export function MascotSay({ emoji = "🐯", children }: { emoji?: string; children: ReactNode }) {
  return (
    <div className="mascot is-small">
      <span className="mascot-face" aria-hidden="true">
        {emoji}
      </span>
      <p className="mascot-bubble">{children}</p>
    </div>
  );
}

export function Card({ title, eyebrow, children }: { title?: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section className="card">
      {(title || eyebrow) && (
        <header className="card-head">
          {eyebrow && <p className="card-eyebrow">{eyebrow}</p>}
          {title && <h2 className="card-title">{title}</h2>}
        </header>
      )}
      {children}
    </section>
  );
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="section-header">
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="info-row">
      <dt className="info-label">{label}</dt>
      <dd className="info-value">{children}</dd>
    </div>
  );
}

export function Chips({ items, tone = "blue" }: { items: string[]; tone?: "blue" | "green" | "red" }) {
  return (
    <ul className="chips">
      {items.map((item) => (
        <li key={item} className={`chip chip-${tone}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function BottomCTA({ label, disabled, onClick }: { label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <div className="bottom-cta">
      <button
        type="button"
        className="cta-button"
        disabled={disabled}
        onClick={() => {
          haptic("tickWeak");
          onClick();
        }}
      >
        {label}
      </button>
    </div>
  );
}

// 결과를 기다리는 동안 마스코트와 함께 결과 모양의 회색 틀을 보여준다
export function Loading({ text }: { text: string }) {
  return (
    <div className="loading" role="status">
      <div className="loading-mascot" aria-hidden="true">
        🐯
      </div>
      <div className="loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="loading-text">{text}</p>
      <div className="skeleton-group" aria-hidden="true">
        <span className="skeleton skeleton-title" />
        <span className="skeleton skeleton-card" />
        <span className="skeleton skeleton-card is-short" />
      </div>
    </div>
  );
}

// sample: 1FATE에 아직 없는 기능(연애운·대운·택일·오늘의 운세)처럼 항상 샘플인 화면
export function ResultFooter({ sample = false }: { sample?: boolean }) {
  return (
    <p className="result-footer">
      {(IS_MOCK || sample) && (
        <>
          지금은 화면 확인용 샘플 결과예요. 1FATE 연동 후 실제 분석이 표시돼요.
          <br />
        </>
      )}
      자기이해를 돕는 참고용 콘텐츠이며, 의료·법률·재정 등 전문 상담을 대신하지 않아요.
    </p>
  );
}

export function ShareActions({ card, message }: { card: ShareCardContent; message: string }) {
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const show = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2000);
  };

  const onSave = async () => {
    setBusy(true);
    try {
      const dataUrl = await renderShareCard(card);
      const ok = await saveImage(dataUrl, `my-saju-${Date.now()}.png`);
      show(ok ? "이미지를 저장했어요 📸" : "저장하지 못했어요. 다시 시도해 주세요");
    } finally {
      setBusy(false);
    }
  };

  const onShare = async () => {
    const link = await createAppLink({ from: "share" });
    const outcome = await shareMessage(`${message}\n\n나도 해보기 👉 ${link}`);
    if (outcome === "copied") show("공유 문구를 복사했어요 💌");
    if (outcome === "failed") show("공유하지 못했어요");
  };

  return (
    <div className="share-actions">
      <button type="button" className="share-button" onClick={onSave} disabled={busy}>
        📸 이미지로 저장
      </button>
      <button type="button" className="share-button" onClick={onShare}>
        💌 친구에게 공유
      </button>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

// 보상형 광고를 보고 여는 프리미엄 영역. 잠겨 있을 땐 흐릿한 미리보기와 열기 버튼을 보여준다.
export function LockedSection({ title, eyebrow, preview, children }: { title: string; eyebrow: string; preview: string; children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const unlock = async () => {
    setBusy(true);
    try {
      const ok = await showRewardedAd();
      if (ok) {
        haptic("success");
        setUnlocked(true);
      } else {
        setToast("광고를 끝까지 보면 열 수 있어요");
        window.setTimeout(() => setToast(null), 2000);
      }
    } finally {
      setBusy(false);
    }
  };

  if (unlocked) {
    return (
      <Card title={title} eyebrow={eyebrow}>
        {children}
      </Card>
    );
  }

  return (
    <section className="card locked">
      <header className="card-head">
        <p className="card-eyebrow">{eyebrow} · PREMIUM</p>
        <h2 className="card-title">{title}</h2>
      </header>
      <p className="locked-preview" aria-hidden="true">
        {preview}
      </p>
      <div className="locked-overlay">
        <span className="locked-icon" aria-hidden="true">
          🔒
        </span>
        <button type="button" className="locked-button" onClick={unlock} disabled={busy}>
          {busy ? "광고를 불러오고 있어요…" : "광고 보고 무료로 열기"}
        </button>
      </div>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </section>
  );
}
