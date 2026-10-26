import { useSyncExternalStore } from "react";
import { todayString } from "./api";
import { getItem, setItem } from "./platform";

// 방문·운세·타로·캐릭터 기록. 기기에만 저장하고 하나의 키에 JSON으로 묶어 둔다.
const KEY = "activity-v1";

export interface FortuneLog {
  score: number;
  title: string;
}

export interface TarotLog {
  cardId: number;
  reversed: boolean;
}

export interface CharacterLog {
  key: string; // "불꽃 돼지"
  hanja: string;
  source: "me" | "friend";
  date: string;
}

export interface ActivityState {
  visits: string[];
  fortunes: Record<string, FortuneLog>;
  tarots: Record<string, TarotLog>;
  characters: Record<string, CharacterLog>;
}

const EMPTY: ActivityState = { visits: [], fortunes: {}, tarots: {}, characters: {} };

let state: ActivityState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit(next: ActivityState) {
  state = next;
  listeners.forEach((l) => l());
  void setItem(KEY, JSON.stringify(next));
}

export async function loadActivity(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ActivityState>;
      state = { ...EMPTY, ...parsed };
    }
  } catch {
    state = EMPTY;
  }
  listeners.forEach((l) => l());
}

export function useActivity(): ActivityState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export function recordVisit(date = todayString()) {
  if (state.visits.includes(date)) return;
  // 연속 기록 계산에는 최근 90일이면 충분하다
  emit({ ...state, visits: [...state.visits, date].sort().slice(-90) });
}

export function recordFortune(date: string, log: FortuneLog) {
  const prev = state.fortunes[date];
  if (prev && prev.score === log.score && prev.title === log.title) return;
  emit({ ...state, fortunes: { ...state.fortunes, [date]: log } });
}

export function recordTarot(date: string, log: TarotLog) {
  const prev = state.tarots[date];
  if (prev && prev.cardId === log.cardId && prev.reversed === log.reversed) return;
  emit({ ...state, tarots: { ...state.tarots, [date]: log } });
}

export function collectCharacter(log: CharacterLog) {
  if (state.characters[log.key]) return;
  emit({ ...state, characters: { ...state.characters, [log.key]: log } });
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return todayString(d);
}

// 오늘(또는 어제)부터 거꾸로 이어진 방문 일수
export function streakOf(visits: string[], today = todayString()): number {
  const set = new Set(visits);
  let cursor = set.has(today) ? today : shiftDate(today, -1);
  let count = 0;
  while (set.has(cursor)) {
    count += 1;
    cursor = shiftDate(cursor, -1);
  }
  return count;
}
