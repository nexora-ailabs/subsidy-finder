import { haptic } from "../platform";
import type { BirthInput, Calendar, Gender } from "../types";

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={value === option.value ? "segmented-item is-active" : "segmented-item"}
          onClick={() => {
            haptic("tickWeak");
            onChange(option.value);
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface BirthFormProps {
  value: BirthInput;
  onChange: (value: BirthInput) => void;
  showCity?: boolean;
}

export function BirthForm({ value, onChange, showCity = true }: BirthFormProps) {
  const set = <K extends keyof BirthInput>(key: K, next: BirthInput[K]) => onChange({ ...value, [key]: next });

  return (
    <div className="form">
      <div className="field">
        <span className="field-label">성별</span>
        <Segmented<Gender>
          options={[
            { value: "female", label: "여자" },
            { value: "male", label: "남자" },
          ]}
          value={value.gender}
          onChange={(v) => set("gender", v)}
        />
      </div>

      <div className="field">
        <span className="field-label">생년월일</span>
        <Segmented<Calendar>
          options={[
            { value: "solar", label: "양력" },
            { value: "lunar", label: "음력" },
          ]}
          value={value.calendar}
          onChange={(v) => set("calendar", v)}
        />
        <input
          className="input"
          type="date"
          min="1900-01-01"
          max="2100-12-31"
          value={value.birthDate}
          onChange={(e) => set("birthDate", e.target.value)}
          aria-label="생년월일"
        />
      </div>

      <label className="field">
        <span className="field-label">
          태어난 시간 <span className="field-optional">선택</span>
        </span>
        <input
          className="input"
          type="time"
          value={value.birthTime ?? ""}
          onChange={(e) => set("birthTime", e.target.value)}
        />
        <span className="field-help">몰라도 괜찮아요! 알면 더 정확해져요 💫</span>
      </label>

      {showCity && (
        <label className="field">
          <span className="field-label">
            태어난 도시 <span className="field-optional">선택</span>
          </span>
          <input
            className="input"
            type="text"
            placeholder="예) 서울"
            value={value.birthCity ?? ""}
            onChange={(e) => set("birthCity", e.target.value)}
          />
        </label>
      )}
    </div>
  );
}
