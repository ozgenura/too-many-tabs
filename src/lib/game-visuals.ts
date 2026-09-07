/**
 * Visual + difficulty tuning for the ERR_TOO_MANY_TABS mini-game.
 * Obstacle kinds ("browser hazards"), crash copy, and the two score thresholds
 * that gate double obstacles and the late-night palette shift.
 */

export type ObstacleKind = "popup" | "cookie" | "loader" | "ad";

/** Score (tabs cleared) at which double obstacles start appearing. */
export const DOUBLE_OBSTACLE_SCORE = 8;
/** Score (tabs cleared) at which the canvas eases into the late-night palette. */
export const LATE_NIGHT_SCORE = 12;
/** Score by which the double-obstacle chance reaches its cap. */
export const DOUBLE_RAMP_TOP = 25;
export const DOUBLE_CHANCE_MIN = 0.15;
export const DOUBLE_CHANCE_MAX = 0.45;
/** Chance per run that an ambient cloud cluster drifts through the background. */
export const GAME_CLOUD_CHANCE = 0.1;
/** Late-night cross-fade duration, ms. */
export const NIGHT_FADE_MS = 1200;

export const OBSTACLE_SPEC: Record<
  ObstacleKind,
  { wMin: number; wRange: number; hMin: number; hRange: number }
> = {
  popup: { wMin: 30, wRange: 10, hMin: 34, hRange: 12 },
  cookie: { wMin: 46, wRange: 18, hMin: 13, hRange: 5 },
  loader: { wMin: 18, wRange: 5, hMin: 20, hRange: 10 },
  ad: { wMin: 40, wRange: 16, hMin: 22, hRange: 7 },
};

export const OBSTACLE_KINDS = Object.keys(OBSTACLE_SPEC) as ObstacleKind[];

const CRASH_MESSAGES: Record<ObstacleKind, string[]> = {
  popup: [
    "crashed into: a popup you didn't ask for",
    "crashed into: a popup that opened itself",
  ],
  cookie: [
    "crashed into: a cookie banner you never dismissed",
    "crashed into: consent preferences, again",
  ],
  loader: [
    "crashed into: something that was still loading",
    "crashed into: a spinner with no end in sight",
  ],
  ad: ["crashed into: an ad, obviously", "crashed into: a banner nobody clicked"],
};

export function pickObstacleKind(tallChance: number): ObstacleKind {
  // tallChance biases towards the taller hazards (popup / ad).
  if (Math.random() < tallChance) return Math.random() < 0.6 ? "popup" : "ad";
  return Math.random() < 0.55 ? "cookie" : "loader";
}

export function makeObstacleSize(kind: ObstacleKind) {
  const s = OBSTACLE_SPEC[kind];
  return {
    w: Math.round(s.wMin + Math.random() * s.wRange),
    h: Math.round(s.hMin + Math.random() * s.hRange),
  };
}

export function crashMessageFor(kind: ObstacleKind) {
  const list = CRASH_MESSAGES[kind];
  return list[Math.floor(Math.random() * list.length)] ?? "crashed";
}

/** Ramped probability of spawning a paired hazard at the given score. */
export function doubleChance(score: number) {
  if (score < DOUBLE_OBSTACLE_SCORE) return 0;
  const t = Math.min(
    1,
    (score - DOUBLE_OBSTACLE_SCORE) / Math.max(1, DOUBLE_RAMP_TOP - DOUBLE_OBSTACLE_SCORE),
  );
  return DOUBLE_CHANCE_MIN + (DOUBLE_CHANCE_MAX - DOUBLE_CHANCE_MIN) * t;
}

export type Rgb = [number, number, number];

/** Resolves any CSS color (incl. oklch) to rgb via a 1x1 canvas. */
export function resolveRgb(color: string, fallback: Rgb): Rgb {
  if (typeof document === "undefined") return fallback;
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const ctx = c.getContext("2d");
    if (!ctx) return fallback;
    ctx.fillStyle = "#000";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0] ?? fallback[0], d[1] ?? fallback[1], d[2] ?? fallback[2]];
  } catch {
    return fallback;
  }
}

export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export function rgba([r, g, b]: Rgb, alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
