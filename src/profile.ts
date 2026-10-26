import { useCallback, useEffect, useState } from "react";
import { getItem, removeItem, setItem } from "./platform";
import type { BirthInput } from "./types";

const KEY = "my-profile-v1";

export function parseBirth(raw: string | null): BirthInput | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<BirthInput>;
    if (!v.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(v.birthDate)) return null;
    return {
      birthDate: v.birthDate,
      birthTime: v.birthTime ?? "",
      calendar: v.calendar === "lunar" ? "lunar" : "solar",
      gender: v.gender === "male" ? "male" : "female",
      birthCity: v.birthCity ?? "",
    };
  } catch {
    return null;
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<BirthInput | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getItem(KEY).then((raw) => {
      setProfile(parseBirth(raw));
      setLoaded(true);
    });
  }, []);

  const save = useCallback(async (next: BirthInput) => {
    setProfile(next);
    await setItem(KEY, JSON.stringify(next));
  }, []);

  const clear = useCallback(async () => {
    setProfile(null);
    await removeItem(KEY);
  }, []);

  return { profile, loaded, save, clear };
}
