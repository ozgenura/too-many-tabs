import { IDLE_TIMEOUT_MS, SPRITE_PROBABILITY } from "./egg-config";

/**
 * Runtime-tunable easter-egg settings. Env vars (see egg-config) provide the
 * defaults; anything the visitor changes in the settings panel is persisted to
 * localStorage and wins over the env value.
 */
export type EggSettings = {
  /** Test mode applies fast, easy-to-observe values for both eggs. */
  testMode: boolean;
  /** Per-egg on/off switches. */
  idleEnabled: boolean;
  spriteEnabled: boolean;
  consoleEnabled: boolean;
  gameEnabled: boolean;
  /** ms of inactivity before "tab sleeping". */
  idleTimeoutMs: number;
  /** 0..1 chance per page load that the wandering sprite appears. */
  spriteProbability: number;
};

export const TEST_MODE_PRESET = {
  idleTimeoutMs: 10_000,
  spriteProbability: 1,
} as const;

export const IDLE_MIN_MS = 3_000;
export const IDLE_MAX_MS = 10 * 60 * 1000;

const STORAGE_KEY = "tmt:egg-settings";

export const defaultSettings: EggSettings = {
  testMode: false,
  idleEnabled: true,
  spriteEnabled: true,
  consoleEnabled: true,
  gameEnabled: true,
  idleTimeoutMs: IDLE_TIMEOUT_MS,
  spriteProbability: SPRITE_PROBABILITY,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function normalizeSettings(raw: unknown): EggSettings {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Partial<EggSettings>;
  const idle = Number(obj.idleTimeoutMs);
  const prob = Number(obj.spriteProbability);
  const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
  return {
    testMode: obj.testMode === true,
    idleEnabled: bool(obj.idleEnabled, true),
    spriteEnabled: bool(obj.spriteEnabled, true),
    consoleEnabled: bool(obj.consoleEnabled, true),
    gameEnabled: bool(obj.gameEnabled, true),
    idleTimeoutMs: Number.isFinite(idle)
      ? clamp(idle, IDLE_MIN_MS, IDLE_MAX_MS)
      : defaultSettings.idleTimeoutMs,
    spriteProbability: Number.isFinite(prob) ? clamp(prob, 0, 1) : defaultSettings.spriteProbability,
  };
}

/** The values the eggs should actually use, after applying test mode. */
export function effectiveSettings(s: EggSettings) {
  const tuned = s.testMode
    ? {
        idleTimeoutMs: TEST_MODE_PRESET.idleTimeoutMs,
        spriteProbability: TEST_MODE_PRESET.spriteProbability,
      }
    : { idleTimeoutMs: s.idleTimeoutMs, spriteProbability: s.spriteProbability };
  return {
    ...tuned,
    idleEnabled: s.idleEnabled,
    spriteEnabled: s.spriteEnabled,
    consoleEnabled: s.consoleEnabled,
    gameEnabled: s.gameEnabled,
  };
}

/** True when two settings objects differ (used for the panel's dirty state). */
export function settingsEqual(a: EggSettings, b: EggSettings) {
  return (
    a.testMode === b.testMode &&
    a.idleEnabled === b.idleEnabled &&
    a.spriteEnabled === b.spriteEnabled &&
    a.consoleEnabled === b.consoleEnabled &&
    a.gameEnabled === b.gameEnabled &&
    a.idleTimeoutMs === b.idleTimeoutMs &&
    a.spriteProbability === b.spriteProbability
  );
}

let current: EggSettings = defaultSettings;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): EggSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeSettings(JSON.parse(raw)) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function getEggSettings(): EggSettings {
  if (!hydrated && typeof window !== "undefined") {
    current = read();
    hydrated = true;
  }
  return current;
}

/** SSR-stable snapshot so hydration never mismatches. */
export function getServerEggSettings(): EggSettings {
  return defaultSettings;
}

export function setEggSettings(patch: Partial<EggSettings>) {
  current = normalizeSettings({ ...getEggSettings(), ...patch });
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    /* storage unavailable — keep in-memory only */
  }
  listeners.forEach((l) => l());
}

export function resetEggSettings() {
  current = defaultSettings;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function subscribeEggSettings(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Test-only: drop cached state. */
export function __resetEggSettingsStore() {
  current = defaultSettings;
  hydrated = false;
  listeners.clear();
}
