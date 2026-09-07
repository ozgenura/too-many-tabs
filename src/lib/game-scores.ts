/**
 * Per-browser persistence for the ERR_TOO_MANY_TABS mini-game.
 * Stores best score (tabs cleared), best survival time, the last few runs
 * and the chosen difficulty in localStorage.
 */

export type GameRecord = { bestScore: number; bestTimeMs: number };
export type GameRun = { score: number; timeMs: number; at: number; difficulty: Difficulty };
export type Difficulty = "easy" | "normal" | "hard";

const KEY = "tmt.game.best.v1";
const RUNS_KEY = "tmt.game.runs.v1";
const DIFFICULTY_KEY = "tmt.game.difficulty.v1";

export const MAX_RECENT_RUNS = 5;

export const EMPTY_RECORD: GameRecord = { bestScore: 0, bestTimeMs: 0 };

export const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

/** Timing / spawn tuning per difficulty. */
export const DIFFICULTY_TUNING: Record<
  Difficulty,
  { speed: number; accel: number; spawnMin: number; spawnRange: number; tallChance: number }
> = {
  easy: { speed: 3.4, accel: 0.0009, spawnMin: 75, spawnRange: 55, tallChance: 0.15 },
  normal: { speed: 4.2, accel: 0.0016, spawnMin: 55, spawnRange: 55, tallChance: 0.35 },
  hard: { speed: 5.4, accel: 0.0026, spawnMin: 38, spawnRange: 38, tallChance: 0.6 },
};

export function readRecord(): GameRecord {
  if (typeof window === "undefined") return EMPTY_RECORD;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_RECORD;
    const parsed = JSON.parse(raw) as Partial<GameRecord>;
    return {
      bestScore: Number(parsed.bestScore) || 0,
      bestTimeMs: Number(parsed.bestTimeMs) || 0,
    };
  } catch {
    return EMPTY_RECORD;
  }
}

export function writeRecord(record: GameRecord): GameRecord {
  if (typeof window === "undefined") return record;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable — keep the in-memory value */
  }
  return record;
}

export function readRuns(): GameRun[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RUNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((r) => ({
        score: Number(r?.score) || 0,
        timeMs: Number(r?.timeMs) || 0,
        at: Number(r?.at) || 0,
        difficulty: (DIFFICULTIES as string[]).includes(r?.difficulty)
          ? (r.difficulty as Difficulty)
          : "normal",
      }))
      .slice(0, MAX_RECENT_RUNS);
  } catch {
    return [];
  }
}

function writeRuns(runs: GameRun[]): GameRun[] {
  const capped = runs.slice(0, MAX_RECENT_RUNS);
  if (typeof window === "undefined") return capped;
  try {
    window.localStorage.setItem(RUNS_KEY, JSON.stringify(capped));
  } catch {
    /* storage unavailable */
  }
  return capped;
}

export function readDifficulty(): Difficulty {
  if (typeof window === "undefined") return "normal";
  try {
    const raw = window.localStorage.getItem(DIFFICULTY_KEY);
    return (DIFFICULTIES as string[]).includes(raw ?? "") ? (raw as Difficulty) : "normal";
  } catch {
    return "normal";
  }
}

export function writeDifficulty(difficulty: Difficulty): Difficulty {
  if (typeof window === "undefined") return difficulty;
  try {
    window.localStorage.setItem(DIFFICULTY_KEY, difficulty);
  } catch {
    /* storage unavailable */
  }
  return difficulty;
}

/** Merges a finished run into the stored record + recent runs and persists both. */
export function commitRun(run: { score: number; timeMs: number; difficulty?: Difficulty }): {
  record: GameRecord;
  runs: GameRun[];
} {
  const prev = readRecord();
  const record = writeRecord({
    bestScore: Math.max(prev.bestScore, run.score),
    bestTimeMs: Math.max(prev.bestTimeMs, run.timeMs),
  });
  const runs = writeRuns([
    {
      score: run.score,
      timeMs: run.timeMs,
      at: Date.now(),
      difficulty: run.difficulty ?? "normal",
    },
    ...readRuns(),
  ]);
  return { record, runs };
}

/** Wipes the stored best record and recent runs for this browser. */
export function clearRecord(): { record: GameRecord; runs: GameRun[] } {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KEY);
      window.localStorage.removeItem(RUNS_KEY);
    } catch {
      /* storage unavailable */
    }
  }
  return { record: EMPTY_RECORD, runs: [] };
}

export function formatTime(ms: number) {
  const total = Math.max(0, ms) / 1000;
  const mins = Math.floor(total / 60);
  const secs = total - mins * 60;
  if (mins > 0) return `${mins}:${secs.toFixed(1).padStart(4, "0")}`;
  return `${secs.toFixed(1)}s`;
}

/** "Aug 28, 3:14pm" — compact stamp for the personal score history list. */
export function formatRunDate(at: number) {
  if (!at) return "unknown";
  const d = new Date(at);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(/\s?([AP])M/i, (_m, p: string) => p.toLowerCase() + "m");
  return `${date}, ${time}`;
}
