const CLASS = "theme-shift";
const DURATION_MS = 520;

let timeout: number | undefined;

/**
 * Briefly enables a global color transition so background/accent changes
 * (light ↔ dark, late-night on/off) fade instead of snapping.
 */
export function runThemeShift() {
  if (typeof window === "undefined") return;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const root = document.documentElement;
  root.classList.add(CLASS);
  window.clearTimeout(timeout);
  timeout = window.setTimeout(() => root.classList.remove(CLASS), DURATION_MS);
}
