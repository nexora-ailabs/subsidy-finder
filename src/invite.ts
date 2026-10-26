import type { BirthInput } from "./types";

// 궁합 초대 링크에 담는 값. 생년월일·시간·양음력·성별만 담고 도시는 넣지 않는다.
export function encodeInvite(input: BirthInput): string {
  const compact = [input.birthDate, input.birthTime ?? "", input.calendar === "lunar" ? "L" : "S", input.gender === "male" ? "M" : "F"].join("|");
  return btoa(compact).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeInvite(token: string | null): BirthInput | null {
  if (!token) return null;
  try {
    const [birthDate, birthTime, cal, gender] = atob(token.replace(/-/g, "+").replace(/_/g, "/")).split("|");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
    return {
      birthDate,
      birthTime: /^\d{2}:\d{2}$/.test(birthTime) ? birthTime : "",
      calendar: cal === "L" ? "lunar" : "solar",
      gender: gender === "M" ? "male" : "female",
      birthCity: "",
    };
  } catch {
    return null;
  }
}
