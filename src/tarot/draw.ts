import { MAJOR_ARCANA, type DrawnCard } from "./cards";

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// 오늘의 한 장은 사람·날짜마다 하루 동안 고정된다
export function dailyCard(seed: string, date: string): DrawnCard {
  const h = hash(`${seed}|${date}|tarot`);
  return {
    card: MAJOR_ARCANA[h % MAJOR_ARCANA.length],
    reversed: (h >>> 8) % 4 === 0,
  };
}

function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

// 고민 타로용으로 덱을 섞는다 (Fisher–Yates)
export function shuffledDeck(): DrawnCard[] {
  const deck = MAJOR_ARCANA.map((card) => ({ card, reversed: randomInt(4) === 0 }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
