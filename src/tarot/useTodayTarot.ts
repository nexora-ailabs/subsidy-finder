import { useCallback, useEffect, useState } from "react";
import { recordTarot } from "../activity";
import { todayString } from "../api";
import { getItem, setItem } from "../platform";
import type { BirthInput } from "../types";
import type { DrawnCard } from "./cards";
import { dailyCard } from "./draw";

const SEED_KEY = "tarot-seed-v1";
const flipKey = (date: string) => `tarot-flipped-${date}`;

// 내 정보가 있으면 생년월일로, 없으면 기기별 임의 값으로 오늘의 카드를 정한다
async function resolveSeed(profile: BirthInput | null): Promise<string> {
  if (profile) return `${profile.birthDate}|${profile.birthTime ?? ""}|${profile.gender}`;
  const saved = await getItem(SEED_KEY);
  if (saved) return saved;
  const seed = crypto.getRandomValues(new Uint32Array(2)).join("-");
  await setItem(SEED_KEY, seed);
  return seed;
}

export function useTodayTarot(profile: BirthInput | null, ready: boolean) {
  const date = todayString();
  const [drawn, setDrawn] = useState<DrawnCard | null>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    Promise.all([resolveSeed(profile), getItem(flipKey(date))]).then(([seed, flag]) => {
      if (!alive) return;
      setDrawn(dailyCard(seed, date));
      setFlipped(flag === "1");
    });
    return () => {
      alive = false;
    };
  }, [profile, ready, date]);

  const flip = useCallback(() => {
    setFlipped(true);
    void setItem(flipKey(date), "1");
    if (drawn) recordTarot(date, { cardId: drawn.card.id, reversed: drawn.reversed });
  }, [date, drawn]);

  return { drawn, flipped, flip, date };
}
