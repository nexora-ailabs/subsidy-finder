import { useState } from "react";
import { BottomCTA } from "../components/ui";
import { haptic } from "../platform";

const SLIDES = [
  {
    emoji: "🐯",
    eyebrow: "WELCOME",
    title: "안녕! 나는 호(虎)야",
    desc: "정통 명리학으로 네 사주를 읽어주는 호랑이야. 생년월일만 알려주면 돼!",
  },
  {
    emoji: "🌤️",
    eyebrow: "DAILY",
    title: "매일 아침 오늘의 운세",
    desc: "하트 점수, 행운의 색과 숫자, 오늘의 타로 한 장까지 매일 새로 준비해 둘게.",
  },
  {
    emoji: "💞",
    eyebrow: "SAJU · TAROT",
    title: "사주, 궁합, 타로까지",
    desc: "내 사주 분석과 신년운세, 친구와의 궁합, 고민 타로를 한곳에서 볼 수 있어.",
  },
];

export function OnboardingScreen({ onFinish }: { onFinish: (register: boolean) => void }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  return (
    <div className="onboarding">
      <button type="button" className="onboarding-skip" onClick={() => onFinish(false)}>
        건너뛰기
      </button>
      <div className="onboarding-body" key={index}>
        <span className="onboarding-emoji" aria-hidden="true">
          {slide.emoji}
        </span>
        <p className="section-eyebrow">{slide.eyebrow}</p>
        <h1 className="onboarding-title">{slide.title}</h1>
        <p className="onboarding-desc">{slide.desc}</p>
      </div>
      <div className="onboarding-dots" aria-hidden="true">
        {SLIDES.map((_, i) => (
          <span key={i} className={i === index ? "dot is-active" : "dot"} />
        ))}
      </div>
      <BottomCTA
        label={last ? "내 정보 등록하고 시작하기" : "다음"}
        onClick={() => {
          if (last) {
            haptic("success");
            onFinish(true);
          } else {
            setIndex(index + 1);
          }
        }}
      />
    </div>
  );
}
