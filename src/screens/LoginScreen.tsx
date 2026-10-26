import { useState } from "react";
import { haptic, tossLogin } from "../platform";

interface LoginScreenProps {
  onLoggedIn: () => void;
  onSkip: () => void;
}

// 앱인토스 미니앱은 토스 로그인을 사용한다. 받은 인가 코드는 서버에서 토스 API로 교환해 사용자를 확인해야 한다.
export function LoginScreen({ onLoggedIn, onSkip }: LoginScreenProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const login = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const outcome = await tossLogin();
      if (outcome.ok) {
        haptic("success");
        onLoggedIn();
      } else {
        setMessage(outcome.reason === "unavailable" ? "토스 앱에서 열면 로그인할 수 있어요" : "로그인을 취소했어요");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login-top">
        <p className="login-eyebrow">
          <span className="faq-dot" aria-hidden="true" /> 이어서 볼 콘텐츠
        </p>
        <div className="login-friends" aria-hidden="true">
          <span className="login-friend is-small">🃏</span>
          <span className="login-friend is-main">🐯</span>
          <span className="login-friend is-small">💘</span>
        </div>
        <p className="login-name">호(虎)</p>
        <p className="login-bubble">
          오늘 사주에 반짝이는 기운이 보인다냥…
          <br />
          아니, 보인다 어흥! 🐾
        </p>
      </div>

      <div className="login-actions">
        <button type="button" className="login-button is-toss" onClick={login} disabled={busy}>
          <span className="login-icon" aria-hidden="true">
            T
          </span>
          <span className="login-label">{busy ? "로그인하는 중…" : "토스로 시작하기"}</span>
          <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="login-button" onClick={onSkip}>
          <span className="login-icon is-plain" aria-hidden="true">
            👀
          </span>
          <span className="login-label">로그인 없이 둘러보기</span>
          <span aria-hidden="true">→</span>
        </button>
        {message && (
          <p className="login-message" role="status">
            {message}
          </p>
        )}
        <p className="login-note">토스 계정으로 따로 가입하지 않고 바로 시작할 수 있어요.</p>
      </div>
    </div>
  );
}
