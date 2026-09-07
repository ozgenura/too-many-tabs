import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearRecord,
  commitRun,
  DIFFICULTIES,
  DIFFICULTY_TUNING,
  EMPTY_RECORD,
  formatRunDate,
  formatTime,
  readDifficulty,
  readRecord,
  readRuns,
  writeDifficulty,
  type Difficulty,
  type GameRecord,
  type GameRun,
} from "@/lib/game-scores";
import {
  crashMessageFor,
  doubleChance,
  GAME_CLOUD_CHANCE,
  LATE_NIGHT_SCORE,
  makeObstacleSize,
  mixRgb,
  NIGHT_FADE_MS,
  pickObstacleKind,
  resolveRgb,
  rgba,
  type ObstacleKind,
  type Rgb,
} from "@/lib/game-visuals";

type Obstacle = { x: number; w: number; h: number; kind: ObstacleKind; cleared: boolean };

const WIDTH = 640;
const HEIGHT = 180;
const GROUND = HEIGHT - 28;
const PLAYER_X = 60;
const PLAYER_SIZE = 18;
const GRAVITY = 0.55;
const JUMP_V = -9.2;
const START_SPEED_FACTOR = 0.85;
const PARALLAX_FACTOR = 0.35;
const BG_TAB_SPACING = 96;

type GameState = "idle" | "playing" | "paused" | "over";

function readToken(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

type Palette = { bg: Rgb; fg: Rgb; accent: Rgb; muted: Rgb; border: Rgb };

const FALLBACK_PALETTE: Palette = {
  bg: [26, 25, 23],
  fg: [237, 234, 226],
  accent: [240, 162, 74],
  muted: [154, 154, 148],
  border: [58, 53, 47],
};

function paletteFromRoot(fallback: Palette): Palette {
  return {
    bg: resolveRgb(readToken("--background", ""), fallback.bg),
    fg: resolveRgb(readToken("--foreground", ""), fallback.fg),
    accent: resolveRgb(readToken("--accent", ""), fallback.accent),
    muted: resolveRgb(readToken("--muted-foreground", ""), fallback.muted),
    border: resolveRgb(readToken("--border", ""), fallback.border),
  };
}

/**
 * Current palette plus the site's real late-night palette, resolved by briefly
 * applying the existing `late-night` class to <html> and reading the same
 * tokens back (no new colors are introduced here).
 */
function readPalettes(): { day: Palette; night: Palette } {
  if (typeof window === "undefined") return { day: FALLBACK_PALETTE, night: FALLBACK_PALETTE };
  const root = document.documentElement;
  const day = paletteFromRoot(FALLBACK_PALETTE);
  const had = root.classList.contains("late-night");
  if (!had) root.classList.add("late-night");
  const night = paletteFromRoot(day);
  if (!had) root.classList.remove("late-night");
  return { day, night };
}

/** Chrome-dino-flavoured obstacle dodge. Space / tap to jump, P pause, R restart. */
export function TabDodgeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState<GameRecord>(EMPTY_RECORD);
  const [runs, setRuns] = useState<GameRun[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [crashLine, setCrashLine] = useState<string | null>(null);
  const difficultyRef = useRef<Difficulty>("normal");
  difficultyRef.current = difficulty;
  const jumpRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load the per-browser record after mount (localStorage is client-only).
  useEffect(() => {
    setBest(readRecord());
    setRuns(readRuns());
    setDifficulty(readDifficulty());
  }, []);

  /** Keeps keyboard controls working after clicking a control button. */
  const focusBoard = useCallback(() => boardRef.current?.focus(), []);

  // World state lives in a ref so pausing can resume exactly where it stopped.
  const worldRef = useRef({
    y: GROUND - PLAYER_SIZE,
    vy: 0,
    obstacles: [] as Obstacle[],
    spawnIn: 60,
    speed: 4.2,
    cleared: 0,
    runMs: 0,
    bgOffset: 0,
    dist: 0,
    nightMs: 0,
    cloudActive: false,
    cloudX: -200,
  });

  const resetWorld = useCallback(() => {
    worldRef.current = {
      y: GROUND - PLAYER_SIZE,
      vy: 0,
      obstacles: [],
      spawnIn: 60,
      speed: DIFFICULTY_TUNING[difficultyRef.current].speed * START_SPEED_FACTOR,
      cleared: 0,
      runMs: 0,
      bgOffset: 0,
      dist: 0,
      nightMs: 0,
      cloudActive: false,
      cloudX: -200,
    };
    setScore(0);
    setElapsed(0);
    setCrashLine(null);
  }, []);

  const restart = useCallback(() => {
    resetWorld();
    setState("playing");
    focusBoard();
  }, [focusBoard, resetWorld]);

  const togglePause = useCallback(() => {
    setState((s) => (s === "playing" ? "paused" : s === "paused" ? "playing" : s));
    focusBoard();
  }, [focusBoard]);

  const press = useCallback(() => {
    const s = stateRef.current;
    focusBoard();
    if (s === "playing") jumpRef.current = true;
    else if (s === "paused") setState("playing");
    else restart();
  }, [focusBoard, restart]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.code === "Space" || e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        press();
        return;
      }
      if (key === "r") {
        e.preventDefault();
        restart();
        return;
      }
      if (key === "p") {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, restart, togglePause]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const { day, night } = readPalettes();
    const w = worldRef.current;
    const tuning = DIFFICULTY_TUNING[difficulty];
    let raf = 0;
    let running = true;

    if (!reduceMotion && !w.cloudActive && Math.random() < GAME_CLOUD_CHANCE) {
      w.cloudActive = true;
      w.cloudX = WIDTH + 40;
    }

    /** 0 → current theme, 1 → late-night tones. */
    const nightMix = () => {
      if (w.cleared < LATE_NIGHT_SCORE) return 0;
      if (reduceMotion) return 1;
      return Math.min(1, w.nightMs / NIGHT_FADE_MS);
    };

    const drawPixelCloud = (x: number, y: number, unit: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, unit * 2, unit);
      ctx.fillRect(x - unit, y + unit, unit * 4, unit);
      ctx.fillRect(x - unit * 2, y + unit * 2, unit * 6, unit);
    };

    /** Faint tab-bar silhouettes; scrolls slower than the foreground. */
    const drawParallax = (mix: number) => {
      const tint = mixRgb(day.accent, night.accent, mix);
      const line = mixRgb(day.border, night.border, mix);
      const top = 26;
      const tabW = 68;
      const tabH = 22;
      ctx.strokeStyle = rgba(line, 0.5);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, top + tabH + 0.5);
      ctx.lineTo(WIDTH, top + tabH + 0.5);
      ctx.stroke();

      const offset = w.bgOffset % BG_TAB_SPACING;
      for (let x = -BG_TAB_SPACING - offset; x < WIDTH + BG_TAB_SPACING; x += BG_TAB_SPACING) {
        const r = 5;
        ctx.fillStyle = rgba(tint, 0.09);
        ctx.beginPath();
        ctx.moveTo(x, top + tabH);
        ctx.lineTo(x + 8, top + r);
        ctx.quadraticCurveTo(x + 10, top, x + 14, top);
        ctx.lineTo(x + tabW - 14, top);
        ctx.quadraticCurveTo(x + tabW - 10, top, x + tabW - 8, top + r);
        ctx.lineTo(x + tabW, top + tabH);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = rgba(tint, 0.16);
        ctx.beginPath();
        ctx.arc(x + 20, top + tabH / 2 + 1, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (w.cloudActive) {
        const c = rgba(tint, 0.42);
        drawPixelCloud(w.cloudX, 10, 4, c);
        drawPixelCloud(w.cloudX + 46, 18, 3, c);
        drawPixelCloud(w.cloudX + 84, 8, 3.5, c);
      }
    };

    /** Faceless tab silhouette with a 2-frame leg cycle. */
    const drawPlayer = (mix: number) => {
      const accent = rgba(mixRgb(day.accent, night.accent, mix));
      const bg = rgba(mixRgb(day.bg, night.bg, mix));
      const airborne = w.y < GROUND - PLAYER_SIZE - 0.5;
      const lean = airborne && !reduceMotion ? 0.12 : 0;
      const squash = airborne && !reduceMotion ? Math.min(0.12, Math.abs(w.vy) / 90) : 0;
      const bodyW = PLAYER_SIZE * (1 - squash);
      const bodyH = PLAYER_SIZE * (1 + squash);
      const legLen = 5;
      const baseY = w.y + PLAYER_SIZE;

      ctx.save();
      ctx.translate(PLAYER_X + PLAYER_SIZE / 2, baseY - legLen);
      ctx.rotate(-lean);
      ctx.fillStyle = accent;

      // tab body: rounded-top trapezoid
      const hw = bodyW / 2;
      const topY = -bodyH;
      ctx.beginPath();
      ctx.moveTo(-hw - 2, 0);
      ctx.lineTo(-hw + 2, topY + 4);
      ctx.quadraticCurveTo(-hw + 3, topY, -hw + 7, topY);
      ctx.lineTo(hw - 7, topY);
      ctx.quadraticCurveTo(hw - 3, topY, hw - 2, topY + 4);
      ctx.lineTo(hw + 2, 0);
      ctx.closePath();
      ctx.fill();

      // dot indicator (punched out of the body)
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(0, topY + bodyH * 0.42, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // legs
      const frame = reduceMotion || airborne ? 0 : Math.floor(w.dist / 12) % 2;
      const front = frame === 0 ? 3 : 6;
      const back = frame === 0 ? -6 : -3;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(back, 0);
      ctx.lineTo(back + (airborne ? -2 : 0), legLen);
      ctx.moveTo(front, 0);
      ctx.lineTo(front + (airborne ? 2 : 0), legLen);
      ctx.stroke();
      ctx.restore();
    };

    const drawObstacle = (o: Obstacle, mix: number) => {
      const muted = mixRgb(day.muted, night.muted, mix);
      const accent = mixRgb(day.accent, night.accent, mix);
      const bg = mixRgb(day.bg, night.bg, mix);
      const top = GROUND - o.h;

      if (o.kind === "popup") {
        ctx.fillStyle = rgba(muted, 0.9);
        ctx.fillRect(o.x, top, o.w, o.h);
        ctx.fillStyle = rgba(bg, 0.9);
        ctx.fillRect(o.x + 1, top + 6, o.w - 2, o.h - 7);
        ctx.strokeStyle = rgba(muted, 0.9);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(o.x + o.w - 7, top + 1.5);
        ctx.lineTo(o.x + o.w - 2.5, top + 4.5);
        ctx.moveTo(o.x + o.w - 2.5, top + 1.5);
        ctx.lineTo(o.x + o.w - 7, top + 4.5);
        ctx.stroke();
        return;
      }

      if (o.kind === "cookie") {
        ctx.fillStyle = rgba(muted, 0.85);
        ctx.fillRect(o.x, top, o.w, o.h);
        ctx.fillStyle = rgba(bg, 0.85);
        ctx.fillRect(o.x + 4, top + 4, o.w * 0.5, 2);
        ctx.fillStyle = rgba(accent, 0.9);
        ctx.fillRect(o.x + o.w - 14, top + 4, 10, o.h - 8);
        return;
      }

      if (o.kind === "ad") {
        ctx.fillStyle = rgba(muted, 0.85);
        ctx.fillRect(o.x, top, o.w, o.h);
        ctx.fillStyle = rgba(bg, 0.85);
        ctx.fillRect(o.x + 4, top + 5, o.w - 12, 2.5);
        ctx.fillRect(o.x + 4, top + 11, o.w - 20, 2.5);
        ctx.fillStyle = rgba(accent, 0.85);
        ctx.fillRect(o.x + o.w - 6, top + 4, 3, 3);
        return;
      }

      // loader: circle with a rotating arc notch
      const r = o.w / 2;
      const cy = top + r;
      const cx = o.x + r;
      ctx.strokeStyle = rgba(muted, 0.5);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = rgba(accent, 0.95);
      const spin = reduceMotion ? 0 : (w.dist / 14) % (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(cx, cy, r - 1, spin, spin + Math.PI * 0.6);
      ctx.stroke();
      ctx.strokeStyle = rgba(muted, 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + r - 1);
      ctx.lineTo(cx, GROUND);
      ctx.stroke();
    };

    const drawScene = () => {
      const mix = nightMix();
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      if (mix > 0) {
        ctx.fillStyle = rgba(mixRgb(day.bg, night.bg, mix), 0.55 * mix);
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }
      drawParallax(mix);

      ctx.strokeStyle = rgba(mixRgb(day.border, night.border, mix));
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND + 0.5);
      ctx.lineTo(WIDTH, GROUND + 0.5);
      ctx.stroke();

      drawPlayer(mix);
      w.obstacles.forEach((o) => drawObstacle(o, mix));
    };

    if (state !== "playing") {
      drawScene();
      return;
    }

    let last = performance.now();

    const spawnObstacle = (x: number) => {
      const kind = pickObstacleKind(tuning.tallChance);
      const size = makeObstacleSize(kind);
      w.obstacles.push({ x, w: size.w, h: size.h, kind, cleared: false });
      return size.w;
    };

    const loop = () => {
      if (!running) return;

      const now = performance.now();
      const dt = Math.min(64, now - last);
      w.runMs += dt;
      last = now;
      setElapsed(w.runMs);
      if (w.cleared >= LATE_NIGHT_SCORE) w.nightMs += dt;

      if (jumpRef.current) {
        jumpRef.current = false;
        if (w.y >= GROUND - PLAYER_SIZE - 0.5) w.vy = JUMP_V;
      }

      w.vy += GRAVITY;
      w.y = Math.min(GROUND - PLAYER_SIZE, w.y + w.vy);
      if (w.y === GROUND - PLAYER_SIZE) w.vy = 0;

      w.spawnIn -= 1;
      if (w.spawnIn <= 0) {
        const width = spawnObstacle(WIDTH + 20);
        if (Math.random() < doubleChance(w.cleared)) {
          spawnObstacle(WIDTH + 20 + width + 74 + Math.round(Math.random() * 22));
        }
        const tighten = Math.min(18, w.cleared * 0.7);
        w.spawnIn =
          Math.max(30, tuning.spawnMin - tighten) + Math.round(Math.random() * tuning.spawnRange);
      }

      // smooth ramp: frame accel plus a gentle score-based lift
      w.speed += tuning.accel;
      const target =
        DIFFICULTY_TUNING[difficultyRef.current].speed * START_SPEED_FACTOR +
        Math.min(3.6, w.cleared * 0.11);
      if (w.speed < target) w.speed += (target - w.speed) * 0.02;

      w.dist += w.speed;
      w.bgOffset += w.speed * (reduceMotion ? 1 : PARALLAX_FACTOR);
      if (w.cloudActive) {
        w.cloudX -= w.speed * 0.12;
        if (w.cloudX < -220) w.cloudActive = false;
      }

      w.obstacles.forEach((o) => {
        o.x -= w.speed;
        if (!o.cleared && o.x + o.w < PLAYER_X) {
          o.cleared = true;
          w.cleared += 1;
          setScore(w.cleared);
        }
      });
      w.obstacles = w.obstacles.filter((o) => o.x + o.w > -40);

      const hitObstacle = w.obstacles.find(
        (o) =>
          PLAYER_X + PLAYER_SIZE > o.x &&
          PLAYER_X < o.x + o.w &&
          w.y + PLAYER_SIZE > GROUND - o.h,
      );

      drawScene();

      if (hitObstacle) {
        running = false;
        setCrashLine(crashMessageFor(hitObstacle.kind));
        const committed = commitRun({
          score: w.cleared,
          timeMs: w.runMs,
          difficulty: difficultyRef.current,
        });
        setBest(committed.record);
        setRuns(committed.runs);
        setState("over");
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [state, difficulty]);

  const statusText =
    state === "idle"
      ? "click, tap or press space to start"
      : state === "paused"
        ? "paused — press P or tap to resume"
        : state === "over"
          ? `${crashLine ?? "crashed"} · ${score} tabs · ${formatTime(elapsed)} — press space or R to retry`
          : "\u00a0";

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-muted-foreground">
        <span data-testid="game-score">
          tabs cleared: {score} <span className="text-subtle">·</span> time: {formatTime(elapsed)}
        </span>
        <span aria-hidden="true">
          space / tap to jump <span className="text-subtle">·</span> P pause{" "}
          <span className="text-subtle">·</span> R restart
        </span>
      </div>
      <div
        ref={boardRef}
        role="button"
        tabIndex={0}
        onClick={press}
        onKeyDown={(e) => {
          if (e.key === "Enter") press();
        }}
        aria-label="Tab dodge game"
        aria-describedby="tab-dodge-instructions"
        data-testid="game-board"
        data-state={state}
        className="mt-2 w-full cursor-pointer rounded-md border border-border bg-card/50 p-2 transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block h-auto w-full" />
        <span
          role="status"
          aria-live="polite"
          data-testid="game-status"
          className="mt-2 block font-mono text-[11px] text-accent"
        >
          {statusText}
        </span>
      </div>
      <p id="tab-dodge-instructions" className="sr-only">
        Keyboard controls: press space, up arrow, or enter to jump. Press P to pause or resume the
        game. Press R to restart from the beginning. Your best score and best survival time are
        saved in this browser.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={togglePause}
          disabled={state === "idle" || state === "over"}
          className="rounded border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-40"
        >
          {state === "paused" ? "resume [P]" : "pause [P]"}
        </button>
        <button
          type="button"
          onClick={restart}
          className="rounded border border-accent/50 px-2 py-1 font-mono text-[11px] text-accent transition-colors hover:bg-accent/10"
        >
          restart [R]
        </button>
        <span className="self-center font-mono text-[11px] text-subtle" data-testid="game-best">
          best: {best.bestScore} tabs <span className="text-subtle">·</span>{" "}
          {formatTime(best.bestTimeMs)}
        </span>
        <button
          type="button"
          onClick={() => {
            const cleared = clearRecord();
            setBest(cleared.record);
            setRuns(cleared.runs);
            focusBoard();
          }}
          disabled={best.bestScore === 0 && best.bestTimeMs === 0 && runs.length === 0}
          data-testid="game-clear-best"
          className="rounded border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-40"
        >
          clear best
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
        <span id="tab-dodge-difficulty-label">difficulty:</span>
        <div
          role="group"
          aria-labelledby="tab-dodge-difficulty-label"
          data-testid="game-difficulty"
          className="flex gap-1"
        >
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={difficulty === d}
              onClick={() => {
                setDifficulty(writeDifficulty(d));
                resetWorld();
                setState("idle");
                focusBoard();
              }}
              className={`rounded border px-2 py-1 transition-colors ${
                difficulty === d
                  ? "border-accent/60 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/40 hover:text-accent"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 font-mono text-[11px]" data-testid="game-recent-runs">
        <span className="text-muted-foreground">your recent tabs:</span>
        {runs.length === 0 ? (
          <p className="mt-1 text-subtle">no attempts yet. go on.</p>
        ) : (
          <ol className="mt-1 space-y-0.5 text-subtle">
            {runs.map((r, i) => (
              <li key={`${r.at}-${i}`} data-testid="game-recent-run">
                {r.score} <span>·</span> {formatRunDate(r.at)} <span>·</span> {formatTime(r.timeMs)}{" "}
                <span>·</span> {r.difficulty}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
