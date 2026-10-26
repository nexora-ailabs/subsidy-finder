import type { BirthInput } from "./types";

export const EMPTY_BIRTH: BirthInput = {
  birthDate: "",
  birthTime: "",
  calendar: "solar",
  gender: "female",
  birthCity: "",
};

export function isBirthValid(value: BirthInput): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.birthDate);
}
