import { useEffect, useState } from "react";
import { runThemeShift } from "@/lib/theme-shift";


const STORAGE_KEY = "tmt:theme";

export type Theme = "light" | "dark";

let current: Theme = "dark";
const listeners = new Set<(t: Theme) => void>();

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function setTheme(next: Theme) {
  current = next;
  window.localStorage.setItem(STORAGE_KEY, next);
  runThemeShift();
  apply(next);
  listeners.forEach((l) => l(next));
}


/** Persisted light/dark theme. Defaults to dark (the site's native mood). */
export function useTheme() {
  const [theme, setLocal] = useState<Theme>(current);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial: Theme = stored === "light" || stored === "dark" ? stored : "dark";
    current = initial;
    apply(initial);
    setLocal(initial);

    const l = (t: Theme) => setLocal(t);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };

  }, []);

  return [theme, setTheme] as const;
}
