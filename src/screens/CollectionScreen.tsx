import { useActivity } from "../activity";
import { ANIMALS, CHARACTER_ELEMENTS } from "../api";
import { Card, MascotSay, TopBar } from "../components/ui";

const ANIMAL_EMOJI: Record<string, string> = {
  쥐: "🐭",
  소: "🐮",
  호랑이: "🐯",
  토끼: "🐰",
  용: "🐲",
  뱀: "🐍",
  말: "🐴",
  양: "🐑",
  원숭이: "🐵",
  닭: "🐔",
  개: "🐶",
  돼지: "🐷",
};

const TOTAL = CHARACTER_ELEMENTS.length * ANIMALS.length;

export function CollectionScreen({ onBack, onCompat }: { onBack: () => void; onCompat: () => void }) {
  const { characters } = useActivity();
  const count = Object.keys(characters).length;

  return (
    <>
      <TopBar title="캐릭터 도감" onBack={onBack} />
      <div className="page-intro theme-compat">
        <MascotSay emoji="🐯">내 사주를 보거나 친구랑 궁합을 보면 캐릭터가 모여!</MascotSay>
        <p className="section-eyebrow">CHARACTER BOOK</p>
        <h2 className="page-intro-title">
          {count} <span className="muted">/ {TOTAL}</span> 모았어요
        </h2>
        <div className="progress" aria-hidden="true">
          <span className="progress-fill" style={{ width: `${(count / TOTAL) * 100}%` }} />
        </div>
      </div>

      {CHARACTER_ELEMENTS.map((el) => (
        <Card key={el.key} title={`${el.word} 캐릭터`} eyebrow={`${el.hanja} · ${el.key}`}>
          <ul className="collection-grid">
            {ANIMALS.map((animal) => {
              const key = `${el.word} ${animal}`;
              const got = characters[key];
              return (
                <li key={key} className={got ? "collection-item is-got" : "collection-item"} data-element={el.hanja}>
                  <span className="collection-emoji" aria-hidden="true">
                    {got ? ANIMAL_EMOJI[animal] : "?"}
                  </span>
                  <span className="collection-name">{got ? animal : "???"}</span>
                  {got?.source === "friend" && <span className="collection-badge">친구</span>}
                </li>
              );
            })}
          </ul>
        </Card>
      ))}

      <button type="button" className="text-link" onClick={onCompat}>
        친구와 궁합 보고 캐릭터 모으기 →
      </button>
    </>
  );
}
