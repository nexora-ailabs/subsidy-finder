import { useState } from "react";
import { collectCharacter } from "../activity";
import { characterFrom, checkCompatibility, profileOf, todayString } from "../api";
import { EMPTY_BIRTH, isBirthValid } from "../birth";
import { BirthForm } from "../components/BirthForm";
import { BottomCTA, Card, Loading, MascotSay, ResultFooter, ShareActions, TopBar } from "../components/ui";
import { encodeInvite } from "../invite";
import { createAppLink, shareMessage } from "../platform";
import type { BirthInput, CompatPerson, CompatibilityResult } from "../types";

function PersonCard({ label, person }: { label: string; person: CompatPerson }) {
  return (
    <div className="person-card">
      <span className="person-element" data-element={person.element}>
        {person.element}
      </span>
      <p className="person-label">{label}</p>
      <p className="person-name">{person.nicknameFull.split(" (")[0]}</p>
      <p className="person-meta">일주 {person.ilju}</p>
      <p className="person-trait">{person.impression}</p>
    </div>
  );
}

interface CompatScreenProps {
  onBack: () => void;
  initial?: BirthInput | null;
  // 친구가 보낸 초대 링크로 들어왔을 때 친구(상대방) 정보
  inviter?: BirthInput | null;
}

export function CompatScreen({ onBack, initial, inviter }: CompatScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [me, setMe] = useState<BirthInput>(initial ?? EMPTY_BIRTH);
  const [partner, setPartner] = useState<BirthInput>(inviter ?? { ...EMPTY_BIRTH, gender: "male" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [inviteToast, setInviteToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invited, setInvited] = useState(Boolean(inviter));

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await checkCompatibility(me, partner);
      setResult(r);
      const mine = characterFrom(r.person1.nicknameFull, r.person1.element);
      const theirs = characterFrom(r.person2.nicknameFull, r.person2.element);
      if (mine) collectCharacter({ ...mine, source: "me", date: todayString() });
      if (theirs) collectCharacter({ ...theirs, source: "friend", date: todayString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "운세를 불러오지 못했어요");
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    const link = await createAppLink({ invite: encodeInvite(me) });
    const outcome = await shareMessage(
      `💞 "${profileOf(me).nicknameShort}"이(가) 우리 궁합을 보자고 초대했어요!\n내 정보만 넣으면 바로 결과가 나와요 👉 ${link}`,
    );
    setInviteToast(outcome === "copied" ? "초대 문구를 복사했어요 💌" : outcome === "failed" ? "공유하지 못했어요" : null);
    window.setTimeout(() => setInviteToast(null), 2000);
  };

  if (loading) {
    return (
      <>
        <TopBar title="궁합" onBack={onBack} />
        <Loading text="두 분의 인연을 읽고 있어요" />
      </>
    );
  }

  if (result) {
    return (
      <>
        <TopBar title="궁합" onBack={() => setResult(null)} />
        <div className="result-hero is-center theme-compat">
          <div className="floating-hearts" aria-hidden="true">
            <span>💗</span>
            <span>💕</span>
            <span>💖</span>
          </div>
          <span className="compat-grade">{result.grade}</span>
          <h2 className="result-title">{result.gradeLabel}</h2>
          <p className="result-desc">{result.summary}</p>
        </div>

        <div className="person-pair">
          <PersonCard label="나" person={result.person1} />
          <span className="person-heart" aria-hidden="true">
            💗
          </span>
          <PersonCard label="상대" person={result.person2} />
        </div>

        <Card title={result.chemistry} eyebrow="CHEMISTRY">
          <span className="relation-tag">{result.relationType}</span>
          <p className="card-text">{result.relationDesc}</p>
        </Card>

        <Card title="잘 맞는 점" eyebrow="STRENGTHS">
          <ul className="bullet-list">
            {result.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Card>

        <Card title="조심할 점" eyebrow="CAUTION">
          <ul className="bullet-list">
            {result.cautions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <p className="one-line-label">💌 호의 연애 조언</p>
          <p className="hint-box">{result.advice}</p>
        </Card>

        <ShareActions
          card={{
            emoji: "💞",
            badge: `우리 궁합 ${result.grade}등급`,
            title: result.gradeLabel,
            subtitle: result.summary,
            lines: [
              `🙋 ${result.person1.nicknameFull.split(" (")[0]}`,
              `💌 ${result.person2.nicknameFull.split(" (")[0]}`,
              `🔗 ${result.chemistry} · ${result.relationType}`,
            ],
            theme: "pink",
          }}
          message={`💞 우리 궁합은 ${result.grade}등급 "${result.gradeLabel}"!\n${result.summary}`}
        />

        <ResultFooter />
        <BottomCTA
          label="다른 사람과도 보기"
          onClick={() => {
            if (invited) {
              setInvited(false);
              setPartner({ ...EMPTY_BIRTH, gender: "male" });
            }
            setResult(null);
            setStep(2);
          }}
        />
      </>
    );
  }

  if (invited && inviter) {
    return (
      <>
        <TopBar title="궁합" onBack={onBack} />
        <div className="page-intro theme-compat">
          <MascotSay emoji="💌">
            "{profileOf(inviter).nicknameShort}"이(가) 너랑 궁합을 보고 싶대!
          </MascotSay>
          <h2 className="page-intro-title">내 정보만 넣으면 바로 결과가 나와요 💘</h2>
          <p className="page-intro-desc">친구 정보는 초대 링크에 이미 담겨 있어요.</p>
        </div>
        {error && <p className="error-box" role="alert">{error}</p>}
        <BirthForm value={me} onChange={setMe} showCity={false} />
        <BottomCTA label="궁합 보기" disabled={!isBirthValid(me)} onClick={submit} />
      </>
    );
  }

  if (step === 1) {
    return (
      <>
        <TopBar title="궁합" onBack={onBack} />
        <div className="page-intro theme-compat">
          <MascotSay emoji="💞">두 사람, 얼마나 잘 맞을까? 두근두근!</MascotSay>
          <p className="step-indicator">STEP 1 / 2</p>
          <h2 className="page-intro-title">먼저 내 정보를 알려주세요 🙋</h2>
        </div>
        <BirthForm value={me} onChange={setMe} showCity={false} />
        {isBirthValid(me) && (
          <div className="invite-box">
            <p className="invite-title">💌 상대 생년월일을 모르나요?</p>
            <p className="invite-desc">링크를 보내면 친구가 자기 정보만 넣고 바로 궁합을 볼 수 있어요. 링크에는 내 생년월일·태어난 시간·성별이 담겨요.</p>
            <button type="button" className="share-button" onClick={sendInvite}>
              💌 친구에게 궁합 링크 보내기
            </button>
            {inviteToast && (
              <div className="toast" role="status">
                {inviteToast}
              </div>
            )}
          </div>
        )}
        <BottomCTA label="다음" disabled={!isBirthValid(me)} onClick={() => setStep(2)} />
      </>
    );
  }

  return (
    <>
      <TopBar title="궁합" onBack={() => setStep(1)} />
      <div className="page-intro theme-compat">
        <MascotSay emoji="💌">이제 그 사람 차례야. 누군지 궁금한걸?</MascotSay>
        <p className="step-indicator">STEP 2 / 2</p>
        <h2 className="page-intro-title">상대방 정보를 알려주세요 💌</h2>
      </div>
      {error && <p className="error-box" role="alert">{error}</p>}
      <BirthForm value={partner} onChange={setPartner} showCity={false} />
      <BottomCTA label="궁합 보기" disabled={!isBirthValid(partner)} onClick={submit} />
    </>
  );
}
