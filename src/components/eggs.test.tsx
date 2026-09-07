import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConsoleEgg, printConsoleEgg, __resetConsoleEgg } from "./ConsoleEgg";
import { SleepIndicator } from "./SleepIndicator";
import { CloudCluster, SPRITE_PROBABILITY, __resetSpriteGuard } from "./CloudCluster";
import { useIdle, IDLE_TIMEOUT_MS } from "@/hooks/use-idle";
import { subscribeEggEvents, __resetEggEvents } from "@/lib/egg-events";

function matchMedia(reduced: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes("reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }));
}

beforeEach(() => {
  window.matchMedia = matchMedia(false) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.documentElement.classList.remove("tab-sleeping");
});

describe("console egg", () => {
  it("seeds the console buffer exactly once per page load", () => {
    __resetConsoleEgg();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<ConsoleEgg />);
    // ascii art + voice line + the probe object that detects the panel opening
    expect(log).toHaveBeenCalledTimes(3);

    // Re-mounting on client navigation must not re-log.
    cleanup();
    render(<ConsoleEgg />);
    expect(printConsoleEgg()).toBe(false);
    expect(log).toHaveBeenCalledTimes(3);
  });

  it("does not announce when the console merely echoes the probe on load", () => {
    // Some browsers read a logged object's properties immediately. Treating
    // that as "DevTools opened" would fire the egg for every visitor.
    __resetConsoleEgg();
    __resetEggEvents();
    const seen: string[] = [];
    subscribeEggEvents((e) => seen.push(e.egg));
    const log = vi.spyOn(console, "log").mockImplementation((...args) => {
      const probe = args[0] as Record<string, unknown> | undefined;
      if (probe && typeof probe === "object") void probe["_"];
    });

    render(<ConsoleEgg />);
    expect(log).toHaveBeenCalled();
    expect(seen).not.toContain("console");
  });

  it("announces when the probe is read later, which is the panel opening", () => {
    __resetConsoleEgg();
    __resetEggEvents();
    const seen: string[] = [];
    subscribeEggEvents((e) => seen.push(e.egg));
    let probe: Record<string, unknown> | undefined;
    vi.spyOn(console, "log").mockImplementation((...args) => {
      const first = args[0] as Record<string, unknown> | undefined;
      if (first && typeof first === "object") probe = first;
    });

    render(<ConsoleEgg />);
    expect(seen).not.toContain("console");

    const realNow = Date.now;
    vi.spyOn(Date, "now").mockImplementation(() => realNow() + 5_000);
    void probe?.["_"];
    expect(seen).toContain("console");
  });

  it("styles the message with %c and the amber accent", () => {
    __resetConsoleEgg();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    printConsoleEgg();

    const [art, style] = log.mock.calls[0] as [string, string];
    expect(art.startsWith("%c")).toBe(true);
    expect(style).toContain("monospace");
    expect(style).toContain("#f0a24a");
  });
});

function IdleProbe() {
  const idle = useIdle();
  return <SleepIndicator sleeping={idle} />;
}

describe("idle / tab sleeping", () => {
  it("uses a 3 minute timeout by default", () => {
    expect(IDLE_TIMEOUT_MS).toBe(180_000);
  });

  it("dims and announces after the idle timeout, and wakes on interaction", () => {
    vi.useFakeTimers();
    render(<IdleProbe />);

    expect(document.documentElement.classList.contains("tab-sleeping")).toBe(false);
    expect(screen.getByTestId("sleep-indicator").textContent).toBe("");

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS + 10);
    });

    expect(document.documentElement.classList.contains("tab-sleeping")).toBe(true);
    const region = screen.getByRole("status");
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.textContent).toContain("tab sleeping · zzz");
    expect(region.textContent).toContain("Move or press a key to wake it");

    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    expect(document.documentElement.classList.contains("tab-sleeping")).toBe(false);
    expect(screen.getByTestId("sleep-indicator").textContent).toBe("");
  });

  it("does not sleep early", () => {
    vi.useFakeTimers();
    render(<IdleProbe />);
    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 1_000);
    });
    expect(document.documentElement.classList.contains("tab-sleeping")).toBe(false);
  });
});

describe("cloud cluster", () => {
  it("keeps the default rare but reachable", () => {
    // Rolled per navigation and capped at one appearance per session, so this
    // is the per-page odds, not the odds of ever seeing it. Low enough to feel
    // like luck; high enough that a real visit usually catches it.
    expect(SPRITE_PROBABILITY).toBeCloseTo(0.12);
  });

  it("appears when the roll lands inside the probability window", () => {
    vi.useFakeTimers();
    __resetSpriteGuard();
    vi.spyOn(Math, "random").mockReturnValue(SPRITE_PROBABILITY / 2);

    render(<CloudCluster />);
    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(screen.queryByTestId("cloud-cluster")).not.toBeNull();
  });

  it("stays away when the roll misses", () => {
    vi.useFakeTimers();
    __resetSpriteGuard();
    vi.spyOn(Math, "random").mockReturnValue(Math.min(1, SPRITE_PROBABILITY + 0.5));

    render(<CloudCluster />);
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(screen.queryByTestId("cloud-cluster")).toBeNull();
  });

  it("triggers on roughly the configured fraction of loads", () => {
    vi.useFakeTimers();
    let hits = 0;
    const runs = 400;
    let seed = 0.001;

    for (let i = 0; i < runs; i += 1) {
      __resetSpriteGuard();
      seed = (seed + 1 / runs) % 1;
      vi.spyOn(Math, "random").mockReturnValue(seed);
      render(<CloudCluster />);
      act(() => {
        vi.advanceTimersByTime(3_000);
      });
      if (screen.queryByTestId("cloud-cluster")) hits += 1;
      cleanup();
    }

    // Uniform rolls => hit rate should track SPRITE_PROBABILITY closely.
    expect(hits / runs).toBeGreaterThan(SPRITE_PROBABILITY - 0.02);
    expect(hits / runs).toBeLessThan(SPRITE_PROBABILITY + 0.02);
  });

  it("still appears under prefers-reduced-motion", () => {
    // It used to bail out here, which meant anyone with the OS setting on
    // could never find the egg at any probability. The CSS decides how it
    // arrives — drifting, or simply fading in where it stands — but whether
    // it happens at all is not a motion question.
    vi.useFakeTimers();
    __resetSpriteGuard();
    window.matchMedia = matchMedia(true) as unknown as typeof window.matchMedia;
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<CloudCluster />);
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(screen.queryByTestId("cloud-cluster")).not.toBeNull();
  });
});
