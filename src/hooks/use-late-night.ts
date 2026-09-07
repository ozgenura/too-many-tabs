import { useEffect, useState } from "react";
import { runThemeShift } from "@/lib/theme-shift";
import { notifyEgg } from "@/lib/egg-events";

const CHECK_INTERVAL_MS = 60_000 * 5;
/** Announced at most once per session: it is a mood, not an alert. */
let announced = false;
const STORAGE_KEY = "tmt:late-night-override";

function isLateNight(now = new Date()) {
  const h = now.getHours();
  return h >= 23 || h < 5;
}

function forcedFromUrl() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const v = params.get("forcenight");
  return v === "1" || v === "true";
}

/** Manual test override: null = auto (clock), true/false = pinned. */
type Override = boolean | null;

let override: Override = null;
const listeners = new Set<(v: Override) => void>();

function readStoredOverride(): Override {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "on") return true;
  if (raw === "off") return false;
  return null;
}

export function setLateNightOverride(next: Override) {
  override = next;
  if (typeof window !== "undefined") {
    if (next === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  }
  runThemeShift();
  listeners.forEach((l) => l(next));
}

/** True between 23:00 and 05:00 local time, or when forced (?forcenight=1 / test toggle). */
export function useLateNight() {
  const [night, setNight] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (override === null) override = readStoredOverride();

    const compute = () => {
      const forced = forcedFromUrl();
      setNight(override ?? (forced || isLateNight()));
    };
    compute();

    const onOverride = () => {
      compute();
      setTick((t) => t + 1);
    };
    listeners.add(onOverride);
    const id = window.setInterval(compute, CHECK_INTERVAL_MS);
    return () => {
      listeners.delete(onOverride);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("late-night", night);
    // The warm shift after 23:00 is deliberate, and completely silent — a
    // visitor at midnight had no way to know it was not just the theme.
    if (night && !announced) {
      announced = true;
      notifyEgg("late-night", "easter egg: late night", "the site warms up after 23:00");
    }
  }, [night]);

  return night;
}

/** Current override value, for the test toggle UI. */
export function useLateNightOverride() {
  const [value, setValue] = useState<Override>(null);

  useEffect(() => {
    if (override === null) override = readStoredOverride();
    setValue(override);
    const l = (v: Override) => setValue(v);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  return [value, setLateNightOverride] as const;
}
