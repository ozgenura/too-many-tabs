/**
 * Tunables for the site's easter eggs, overridable via env vars so they can be
 * adjusted without touching component source:
 *
 *   VITE_IDLE_TIMEOUT_MS   — ms of inactivity before "tab sleeping" (default 180000 = 3 min)
 *   VITE_SPRITE_PROBABILITY — chance per navigation the wandering sprite appears,
 *                             shown at most once per session (default 0.12)
 */

const DEFAULT_IDLE_TIMEOUT_MS = 3 * 60 * 1000;
const DEFAULT_SPRITE_PROBABILITY = 0.12;

function readNumber(raw: unknown, fallback: number, min: number, max: number) {
  const n = typeof raw === "string" || typeof raw === "number" ? Number(raw) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const IDLE_TIMEOUT_MS = readNumber(env["VITE_IDLE_TIMEOUT_MS"], DEFAULT_IDLE_TIMEOUT_MS, 1_000, 60 * 60 * 1000);

export const SPRITE_PROBABILITY = readNumber(env["VITE_SPRITE_PROBABILITY"], DEFAULT_SPRITE_PROBABILITY, 0, 1);

export { readNumber as __readNumberForTests };
