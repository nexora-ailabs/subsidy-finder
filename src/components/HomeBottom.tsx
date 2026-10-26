import { useState } from "react";
import { CONTACT_URL, REVIEWS, USER_COUNT } from "../config";
import { createAppLink, haptic, openExternal, requestAppReview, shareMessage } from "../platform";

const FAQ = [
  {
    q: "어떤 서비스인가요?",
    a: "생년월일로 사주·신년운세·궁합·연애운·대운·택일을 보고, 매일 오늘의 운세와 타로 한 장을 받아볼 수 있는 운세 앱이에요.",
  },
  {
    q: "사주 해석은 무엇을 근거로 하나요?",
    a: "자평진전·적천수·명리정종 3대 고전을 바탕으로 한 1FATE 호작(虎鵲) 엔진의 분석을 사용해요. 일부 기능은 아직 샘플 결과로 보여드리고 있어요.",
  },
  {
    q: "태어난 시간을 몰라도 볼 수 있나요?",
    a: "네, 생년월일만으로도 볼 수 있어요. 태어난 시간을 알면 결과가 더 정확해져요.",
  },
  {
    q: "무료로 볼 수 있는 건 무엇인가요?",
    a: "모든 기본 운세와 타로는 무료예요. 신년운세 월별 흐름, 타로 심층 해석처럼 일부 상세 내용은 광고를 보고 무료로 열 수 있어요.",
  },
  {
    q: "내 정보는 어디에 저장되나요?",
    a: "입력한 정보와 기록은 이 기기에만 저장돼요. 홈 > 내 정보에서 언제든 지울 수 있어요.",
  },
  {
    q: "사주를 보면 미래를 알 수 있나요?",
    a: "사주는 타고난 기질과 흐름을 참고하는 자기이해 도구예요. 중요한 결정은 사주만으로 하지 말고 참고로만 봐 주세요.",
  },
  {
    q: "호(虎)는 누구인가요?",
    a: "사주를 읽어주는 이 앱의 호랑이 친구예요. 어흥! 🐯",
  },
];

export function HomeBottom() {
  const [open, setOpen] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const show = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2000);
  };

  const shareApp = async () => {
    haptic("tickWeak");
    const link = await createAppLink({ from: "home" });
    const outcome = await shareMessage(`🐯 내 사주를 알아볼까요?\n사주·궁합·타로를 한 번에! 👉 ${link}`);
    if (outcome === "copied") show("링크를 복사했어요 💌");
  };

  const writeReview = async () => {
    const ok = await requestAppReview();
    if (!ok) show("토스 앱에서 후기를 남길 수 있어요");
  };

  return (
    <section className="home-bottom">
      {USER_COUNT !== null && (
        <div className="together">
          <p className="together-label">호와 함께하는 친구</p>
          <p className="together-count">
            {USER_COUNT.toLocaleString("ko-KR")}
            <small>명</small>
          </p>
        </div>
      )}
      <button type="button" className="pill-button" onClick={shareApp}>
        🐾 친구에게 공유하기
      </button>

      <div className="divider" />

      <div className="reviews">
        <p className="bottom-title">이용 후기</p>
        {REVIEWS.length > 0 ? (
          <ul className="review-track">
            {REVIEWS.map((r, i) => (
              <li key={i} className="review-card">
                <span className="review-stars" aria-label={`5점 만점에 ${r.stars}점`}>
                  {"★".repeat(r.stars)}
                </span>
                <p className="review-text">{r.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="review-empty">
            <p>아직 후기가 없어요. 첫 번째 후기를 남겨 주세요!</p>
          </div>
        )}
        <button type="button" className="text-link" onClick={writeReview}>
          ✍️ 후기 남기기
        </button>
      </div>

      <div className="divider" />

      <div className="faq">
        <p className="bottom-title">자주 묻는 질문</p>
        <ul className="faq-list">
          {FAQ.map((item, i) => (
            <li key={item.q} className={open === i ? "faq-item is-open" : "faq-item"}>
              <button type="button" className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                <span className="faq-dot" aria-hidden="true" />
                <span className="faq-text">{item.q}</span>
                <svg className="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {open === i && <p className="faq-a">{item.a}</p>}
            </li>
          ))}
        </ul>
      </div>

      {CONTACT_URL && (
        <button type="button" className="pill-button" onClick={() => openExternal(CONTACT_URL)}>
          💬 문의하기
        </button>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </section>
  );
}
