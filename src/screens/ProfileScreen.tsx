import { useState } from "react";
import { EMPTY_BIRTH, isBirthValid } from "../birth";
import { BirthForm } from "../components/BirthForm";
import { BottomCTA, MascotSay, TopBar } from "../components/ui";
import type { BirthInput } from "../types";

interface ProfileScreenProps {
  profile: BirthInput | null;
  onSave: (input: BirthInput) => Promise<void>;
  onClear: () => Promise<void>;
  onBack: () => void;
}

export function ProfileScreen({ profile, onSave, onClear, onBack }: ProfileScreenProps) {
  const [input, setInput] = useState<BirthInput>(profile ?? EMPTY_BIRTH);

  return (
    <>
      <TopBar title="내 정보" onBack={onBack} />
      <div className="page-intro theme-daily">
        <MascotSay emoji="🐯">한 번 저장해 두면 매번 입력하지 않아도 돼!</MascotSay>
        <h2 className="page-intro-title">{profile ? "내 정보를 수정해요 ✏️" : "내 정보를 등록해요 💾"}</h2>
        <p className="page-intro-desc">입력한 정보는 이 기기에만 저장돼요.</p>
      </div>
      <BirthForm value={input} onChange={setInput} />
      {profile && (
        <button
          type="button"
          className="text-link is-danger"
          onClick={async () => {
            await onClear();
            onBack();
          }}
        >
          🗑️ 저장된 정보 지우기
        </button>
      )}
      <BottomCTA
        label="저장하기"
        disabled={!isBirthValid(input)}
        onClick={async () => {
          await onSave(input);
          onBack();
        }}
      />
    </>
  );
}
