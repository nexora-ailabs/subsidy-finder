import { useEffect, useState } from "react";
import "./App.css";
import "./polish.css";
import "./features.css";
import "./home.css";
import { loadActivity, recordFortune, recordVisit, streakOf, useActivity } from "./activity";
import { getDailyFortune, profileOf } from "./api";
import { decodeInvite } from "./invite";
import { getItem, haptic, readLaunchParam, requestDailyNotification, setItem } from "./platform";
import { useProfile } from "./profile";
import { HomeBottom } from "./components/HomeBottom";
import { SectionHeader } from "./components/ui";
import { DaeunScreen } from "./screens/DaeunScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { LoveScreen } from "./screens/LoveScreen";
import { TaekilScreen } from "./screens/TaekilScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { CollectionScreen } from "./screens/CollectionScreen";
import { CompatScreen } from "./screens/CompatScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { PrivacyScreen } from "./screens/PrivacyScreen";
import { DailyScreen, Hearts } from "./screens/DailyScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { SajuScreen } from "./screens/SajuScreen";
import { TarotSpreadScreen } from "./screens/TarotSpreadScreen";
import { TarotTodayScreen } from "./screens/TarotTodayScreen";
import { YearScreen } from "./screens/YearScreen";
import { TarotCardView } from "./tarot/TarotCardView";
import { useTodayTarot } from "./tarot/useTodayTarot";
import type { BirthInput, DailyFortuneResult } from "./types";

type Screen =
  | "home"
  | "daily"
  | "saju"
  | "year"
  | "compat"
  | "profile"
  | "tarot-today"
  | "tarot"
  | "calendar"
  | "collection"
  | "privacy"
  | "love"
  | "daeun"
  | "taekil"
  | "login";

const LOGIN_KEY = "toss-login-v1";

const ONBOARDED_KEY = "onboarded-v1";

interface Menu {
  screen: Screen;
  emoji: string;
  title: string;
  desc: string;
  tag?: string;
}

// 홈 맨 위 바로가기. 자주 찾는 운세를 한눈에 보이게 앞쪽에 둔다
const QUICK_MENUS: { screen: Screen; emoji: string; label: string; tag?: string; tone: string }[] = [
  { screen: "love", emoji: "💘", label: "연애운", tag: "HOT", tone: "pink" },
  { screen: "daeun", emoji: "🌊", label: "대운", tone: "sky" },
  { screen: "year", emoji: "🍀", label: "연운", tone: "mint" },
  { screen: "taekil", emoji: "📅", label: "택일", tone: "butter" },
  { screen: "saju", emoji: "🔮", label: "내 사주", tone: "lavender" },
  { screen: "compat", emoji: "💞", label: "궁합", tag: "인기", tone: "pink" },
  { screen: "tarot", emoji: "🃏", label: "고민 타로", tone: "lavender" },
  { screen: "collection", emoji: "🐾", label: "도감", tone: "peach" },
];

function QuickMenu({ onSelect }: { onSelect: (screen: Screen) => void }) {
  return (
    <nav className="quick-grid" aria-label="바로가기">
      {QUICK_MENUS.map((m) => (
        <button key={m.screen} type="button" className="quick-item" onClick={() => onSelect(m.screen)}>
          <span className={`quick-icon tone-${m.tone}`} aria-hidden="true">
            {m.emoji}
          </span>
          <span className="quick-label">{m.label}</span>
          {m.tag && <span className="quick-tag">{m.tag}</span>}
        </button>
      ))}
    </nav>
  );
}

const MY_MENUS: Menu[] = [
  { screen: "calendar", emoji: "📅", title: "운세 기록", desc: "연속 방문 · 날짜별 운세와 타로" },
  { screen: "collection", emoji: "🐾", title: "캐릭터 도감", desc: "사주 캐릭터 60종 모으기" },
];

function MenuButton({ menu, onSelect }: { menu: Menu; onSelect: (screen: Screen) => void }) {
  return (
    <button type="button" className={`menu-item menu-${menu.screen}`} onClick={() => onSelect(menu.screen)}>
      <span className="menu-emoji" aria-hidden="true">
        {menu.emoji}
      </span>
      <span className="menu-text">
        <span className="menu-title">
          {menu.title}
          {menu.tag && <span className="menu-tag">{menu.tag}</span>}
        </span>
        <span className="menu-desc">{menu.desc}</span>
      </span>
      <svg className="menu-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function TarotTeaser({ profile, ready, onOpen }: { profile: BirthInput | null; ready: boolean; onOpen: () => void }) {
  const { drawn, flipped } = useTodayTarot(profile, ready);
  return (
    <button type="button" className="tarot-teaser" onClick={onOpen}>
      <TarotCardView drawn={drawn} flipped={flipped} size="sm" />
      <span className="menu-text">
        <span className="today-label">🃏 오늘의 타로</span>
        <span className="today-title">{flipped && drawn ? drawn.card.nameKo : "오늘의 한 장 뽑기"}</span>
        <span className="today-more">
          {flipped && drawn ? drawn.card.keywords.map((k) => `#${k}`).join(" ") : "하루 한 번, 카드를 뒤집어 보세요"}
        </span>
      </span>
      <svg className="menu-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function TodayCard({ profile, onOpen, onEdit }: { profile: BirthInput; onOpen: () => void; onEdit: () => void }) {
  const [today, setToday] = useState<DailyFortuneResult | null>(null);

  useEffect(() => {
    let alive = true;
    getDailyFortune(profile).then((r) => {
      recordFortune(r.date, { score: r.score, title: r.title });
      if (alive) setToday(r);
    });
    return () => {
      alive = false;
    };
  }, [profile]);

  const streak = streakOf(useActivity().visits);

  return (
    <section className="my-card">
      <div className="my-card-head">
        <span className="my-card-badges">
          <span className="my-card-badge">🪪 MY</span>
          {streak >= 2 && <span className="streak-badge">🔥 {streak}일 연속</span>}
        </span>
        <button type="button" className="my-card-edit" onClick={onEdit}>
          수정
        </button>
      </div>
      <p className="my-card-name">{profileOf(profile).nicknameShort}</p>
      <button type="button" className="today-box" onClick={onOpen}>
        <span className="today-label">🌤️ 오늘의 운세</span>
        {today ? (
          <>
            <Hearts score={today.score} size="sm" />
            <span className="today-title">{today.title}</span>
            <span className="today-more">
              행운의 색 {today.lucky.color} · 숫자 {today.lucky.number} <span aria-hidden="true">›</span>
            </span>
          </>
        ) : (
          <span className="today-title">오늘의 기운을 읽고 있어요…</span>
        )}
      </button>
    </section>
  );
}

function Home({
  profile,
  loaded,
  loggedIn,
  onSelect,
}: {
  profile: BirthInput | null;
  loaded: boolean;
  loggedIn: boolean;
  onSelect: (screen: Screen) => void;
}) {
  return (
    <>
      <div className="home-topbar">
        {loggedIn ? (
          <button type="button" className="login-pill is-in" onClick={() => onSelect("profile")}>
            🪪 내 정보
          </button>
        ) : (
          <button type="button" className="login-pill" onClick={() => onSelect("login")}>
            로그인
          </button>
        )}
      </div>
      <header className="home-header">
        <div className="mascot">
          <span className="mascot-face" aria-hidden="true">
            🐯
          </span>
          <p className="mascot-bubble">안녕! 나는 호(虎)야. 네 사주를 읽어줄게 ✨</p>
        </div>
        <h1 className="home-title">
          내 <em className="hl">사주</em>를
          <br />
          알아볼까요?
        </h1>
        <p className="home-desc">생년월일만 있으면 바로 볼 수 있어요 🌸</p>
      </header>

      <QuickMenu onSelect={onSelect} />

      <SectionHeader eyebrow="TODAY" title="오늘의 운세" />

      {loaded && profile && <TodayCard profile={profile} onOpen={() => onSelect("daily")} onEdit={() => onSelect("profile")} />}

      {loaded && !profile && (
        <button type="button" className="register-card" onClick={() => onSelect("daily")}>
          <span className="register-emoji" aria-hidden="true">
            🌤️
          </span>
          <span className="menu-text">
            <span className="menu-title">매일 오늘의 운세 받기</span>
            <span className="menu-desc">내 정보를 한 번만 등록하면 매일 바로 보여드려요</span>
          </span>
          <span className="register-cta">등록</span>
        </button>
      )}

      {loaded && <TarotTeaser profile={profile} ready={loaded} onOpen={() => onSelect("tarot-today")} />}

      <SectionHeader eyebrow="MY" title="나의 기록" />
      <nav className="menu-list" aria-label="나의 기록 메뉴">
        {MY_MENUS.map((menu) => (
          <MenuButton key={menu.screen} menu={menu} onSelect={onSelect} />
        ))}
      </nav>
      <NotifyCard />

      <section className="trust-box">
        <p className="trust-title">믿을 수 있는 분석</p>
        <ul className="trust-list">
          <li>
            <strong>정통 명리학</strong>
            <span>자평진전 · 적천수 · 명리정종 3대 고전 기반</span>
          </li>
          <li>
            <strong>정밀 계산</strong>
            <span>진태양시 보정 · 음력/윤달 자동 변환</span>
          </li>
          <li>
            <strong>분석 엔진</strong>
            <span>1FATE 호작(虎鵲) 엔진</span>
          </li>
        </ul>
      </section>

      <HomeBottom />

      <p className="home-footer">
        자기이해를 돕는 참고용 콘텐츠이며, 의료·법률·재정 등 전문 상담을 대신하지 않아요.
        <br />
        <button type="button" className="text-link is-small" onClick={() => onSelect("privacy")}>
          개인정보 처리 안내
        </button>
      </p>
    </>
  );
}

function NotifyCard() {
  const [message, setMessage] = useState<string | null>(null);

  const onClick = async () => {
    haptic("tickWeak");
    const outcome = await requestDailyNotification();
    setMessage(
      outcome === "agreed"
        ? "매일 아침 운세 알림을 보내드릴게요 🔔"
        : outcome === "rejected"
          ? "알림을 받지 않기로 했어요"
          : "토스 앱에서 열면 알림을 받을 수 있어요",
    );
    window.setTimeout(() => setMessage(null), 2200);
  };

  return (
    <div className="notify-card">
      <span className="notify-emoji" aria-hidden="true">
        🔔
      </span>
      <span className="menu-text">
        <span className="menu-title">매일 아침 운세 알림</span>
        <span className="menu-desc">아침 8시에 오늘의 운세를 알려드려요</span>
      </span>
      <button type="button" className="register-cta" onClick={onClick}>
        받기
      </button>
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </div>
  );
}

// 궁합 초대 링크로 들어왔으면 초대한 친구 정보를 읽는다
const LAUNCH_INVITER = decodeInvite(readLaunchParam("invite"));

function App() {
  const [screen, setScreen] = useState<Screen>(LAUNCH_INVITER ? "compat" : "home");
  const { profile, loaded, save, clear } = useProfile();
  // 첫 실행이면 소개 화면을 먼저 보여준다 (초대 링크로 들어온 경우는 바로 궁합으로)
  const [onboarding, setOnboarding] = useState<boolean | null>(LAUNCH_INVITER ? false : null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    loadActivity().then(() => recordVisit());
    if (!LAUNCH_INVITER) getItem(ONBOARDED_KEY).then((v) => setOnboarding(v !== "1"));
    getItem(LOGIN_KEY).then((v) => setLoggedIn(v === "1"));
  }, []);

  useEffect(() => {
    // 초대 링크로 바로 궁합 화면에 들어온 경우에도 뒤로 가기가 홈으로 오도록 홈을 히스토리 아래에 깐다
    if (LAUNCH_INVITER) {
      window.history.replaceState({ screen: "home" }, "", window.location.pathname);
      window.history.pushState({ screen: "compat" }, "");
    }
    // 기기 뒤로 가기가 홈으로 돌아오도록 히스토리에 화면을 쌓는다
    const onPop = (e: PopStateEvent) => setScreen((e.state?.screen as Screen) ?? "home");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const open = (next: Screen) => {
    window.history.pushState({ screen: next }, "");
    setScreen(next);
    window.scrollTo(0, 0);
  };

  const back = () => window.history.back();

  const finishOnboarding = (register: boolean) => {
    void setItem(ONBOARDED_KEY, "1");
    setOnboarding(false);
    if (register && !profile) open("daily");
  };

  if (onboarding === null) return null;
  if (onboarding) return <OnboardingScreen onFinish={finishOnboarding} />;

  return (
    <main className="app">
      <div className="sparkles" aria-hidden="true">
        <span>✦</span>
        <span>♡</span>
        <span>✧</span>
        <span>♡</span>
        <span>✦</span>
      </div>
      {screen === "home" && <Home profile={profile} loaded={loaded} loggedIn={loggedIn} onSelect={open} />}
      {screen === "login" && (
        <LoginScreen
          onLoggedIn={() => {
            void setItem(LOGIN_KEY, "1");
            setLoggedIn(true);
            back();
          }}
          onSkip={back}
        />
      )}
      {screen === "love" && <LoveScreen key={String(loaded)} onBack={back} onCompat={() => open("compat")} initial={profile} />}
      {screen === "daeun" && <DaeunScreen key={String(loaded)} onBack={back} initial={profile} />}
      {screen === "taekil" && <TaekilScreen key={String(loaded)} onBack={back} initial={profile} />}
      {screen === "daily" && (
        <DailyScreen profile={profile} onSaveProfile={save} onBack={back} onEditProfile={() => open("profile")} />
      )}
      {screen === "profile" && <ProfileScreen profile={profile} onSave={save} onClear={clear} onBack={back} />}
      {screen === "tarot-today" && (
        <TarotTodayScreen profile={profile} ready={loaded} onBack={back} onOpenSpread={() => open("tarot")} />
      )}
      {screen === "tarot" && <TarotSpreadScreen onBack={back} />}
      {screen === "calendar" && <CalendarScreen onBack={back} />}
      {screen === "collection" && <CollectionScreen onBack={back} onCompat={() => open("compat")} />}
      {screen === "privacy" && <PrivacyScreen onBack={back} />}
      {/* key로 저장된 정보를 불러온 뒤 폼 초기값이 반영되게 한다 */}
      {screen === "saju" && <SajuScreen key={String(loaded)} onBack={back} initial={profile} />}
      {screen === "year" && <YearScreen key={String(loaded)} onBack={back} initial={profile} />}
      {screen === "compat" && <CompatScreen key={String(loaded)} onBack={back} initial={profile} inviter={LAUNCH_INVITER} />}
    </main>
  );
}

export default App;
