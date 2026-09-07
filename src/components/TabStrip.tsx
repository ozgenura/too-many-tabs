import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { tabs } from "@/data/tabs";
import { useNavPulse } from "@/hooks/use-nav-pulse";
import { ThemeToggle } from "./ThemeToggle";
import { BoringToggle } from "./BoringToggle";
import { NavProgress } from "./NavProgress";
import { SleepIndicator } from "./SleepIndicator";

/**
 * Routes that stay out of the tab bar until you actually open them — reachable
 * from ⌘K, "/", or a link somewhere in the site. Finding one is meant to feel
 * like finding it; only the most recent stays open, so the strip stays short.
 */
const sessionTabs = [
  { label: "chrome://tabs", short: "tabs", to: "/all-projects" },
  { label: "untitled draft", short: "draft", to: "/draft" },
  { label: "press-kit", short: "kit", to: "/press-kit" },
] as const;

/**
 * Which session tab, if any, is leaving the strip.
 *
 * Pulled out of the effect because the edge cases are the whole rule: the
 * first session tab of a visit replaces nothing, re-entering the same tab
 * closes nothing, and a path that is not a session tab is not a tab at all.
 */
export function closingSessionTab(previous: string | null, next: string | null) {
  if (previous === next) return null;
  return sessionTabs.find((tab) => tab.to === previous) ?? null;
}

const shortLabels: Record<string, string> = {
  "/": "tmt",
  "/work": "work",
  "/notes": "notes",
  "/localhost": "5173",
  "/about": "me",
  "/draft": "draft",
};

const coreTabs = tabs.map((tab) => ({
  ...tab,
  short: shortLabels[tab.to] ?? tab.label,
}));

export function TabStrip({
  onOpenPalette,
  onNewTab,
  sleeping = false,
}: {
  onOpenPalette?: () => void;
  onNewTab?: () => void;
  sleeping?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigating = useNavPulse();
  // Only one dynamic tab lives in the bar at a time; a new one replaces it.
  const [dynamicPath, setDynamicPath] = useState<string | null>(null);
  // The tab being replaced, kept around just long enough to close on screen.
  const [closing, setClosing] = useState<StripTab | null>(null);
  const previousDynamic = useRef<string | null>(null);

  // Left over from when the dynamic tab was persisted. Cleared so an old value
  // in a returning visitor's browser cannot outlive the change.
  useEffect(() => {
    try {
      sessionStorage.removeItem("tmt:session-tab");
    } catch {
      /* ignore */
    }
  }, []);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const match = sessionTabs.find((tab) => tab.to === pathname);
    if (!match) return;
    // Not persisted: a tab you found stays open for the visit and is gone on a
    // fresh load. It used to sit in sessionStorage, which Chrome restores along
    // with the rest of a session — so a "session" tab outlived the session.
    setDynamicPath(match.to);
  }, [pathname]);

  // A tab that is swapped out should be seen leaving. Without this the strip
  // silently re-rendered with a different label in the same place, which is
  // the one thing a browser tab never does.
  useEffect(() => {
    const outgoing = closingSessionTab(previousDynamic.current, dynamicPath);
    if (previousDynamic.current === dynamicPath) return;
    previousDynamic.current = dynamicPath;
    if (!outgoing) return;
    setClosing(outgoing);
    const id = window.setTimeout(() => setClosing(null), 240);
    return () => window.clearTimeout(id);
  }, [dynamicPath]);

  const dynamic = sessionTabs.find((tab) => tab.to === dynamicPath);
  const visible = dynamic ? [...coreTabs, dynamic] : coreTabs;
  // The first tab is pinned outside the scroller; everything else scrolls.
  const [pinnedTab, ...scrollingTabs] = visible as [StripTab, ...StripTab[]];

  /**
   * A tab appended to the end (chrome://tabs, press-kit) lands outside the
   * visible strip when the strip is narrower than its contents. Nudge it into
   * view by setting scrollLeft — scrollIntoView would move the page too.
   *
   * Only scrolls when the active tab is actually out of view, so it never
   * fights a visitor who scrolled the strip themselves.
   */
  const revealActive = useCallback(() => {
    const scroller = scrollerRef.current;
    const active = scroller?.querySelector<HTMLElement>('[data-status="active"]');
    if (!scroller || !active) return;
    const left = active.offsetLeft;
    const right = left + active.offsetWidth;
    const PAD = 12;
    if (left < scroller.scrollLeft) {
      scroller.scrollLeft = Math.max(0, left - PAD);
    } else if (right > scroller.scrollLeft + scroller.clientWidth) {
      scroller.scrollLeft = right - scroller.clientWidth + PAD;
    }
  }, []);

  useEffect(() => {
    revealActive();
  }, [pathname, dynamicPath, revealActive]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    // Resizing changes what fits, so the active tab can fall out of view
    // without any navigation happening.
    const ro = new ResizeObserver(() => {
      update();
      revealActive();
    });
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [visible.length, revealActive]);

  // Pinned like real browser chrome. The strip used to scroll away, which
  // meant the one part of the metaphor that is always true in a browser was
  // the part that disappeared — along with ⌘K, the theme toggle and the
  // navigation progress bar.
  return (
    <div className="sticky top-0 z-40 border-b border-border/70 bg-card/70 backdrop-blur-sm print:hidden">
      {/* Same column as the page content: a strip that starts somewhere else
          reads as misaligned. It fits because the always-open tabs are few —
          see src/data/tabs.ts. */}
      <nav
        aria-label="Open tabs"
        // Tight gaps on mobile: at 375px the six gaps were costing ~48px, which
        // is more than a tab. That squeezed the scroller below the width of a
        // single expanded tab, so the active one could never be fully visible.
        className="mx-auto flex max-w-5xl items-end gap-1 px-4 pt-2 sm:gap-3 sm:px-8"
      >
        {/* Pinned, outside the scroller: whatever else scrolls away, the way
            home does not. Same reason a browser pins a tab to the left. */}
        <TabLink tab={pinnedTab} spinning={navigating && pinnedTab.to === pathname} />

        <div className="relative min-w-0 flex-1">
          <div
            ref={scrollerRef}
            className="no-scrollbar flex items-end gap-1 overflow-x-auto overscroll-x-contain"
          >
            {scrollingTabs.map((tab) => (
              <TabLink
                key={tab.to}
                tab={tab}
                entering={tab.to === dynamic?.to}
                spinning={navigating && tab.to === pathname}
              />
            ))}
            {closing ? <TabLink key={`closing-${closing.to}`} tab={closing} closing /> : null}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-card to-transparent transition-opacity duration-200"
            style={{ opacity: edges.left ? 1 : 0 }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card to-transparent transition-opacity duration-200"
            style={{ opacity: edges.right ? 1 : 0 }}
          />
        </div>
        <SleepIndicator sleeping={sleeping} />
        <ThemeToggle />
        <BoringToggle />
        {onOpenPalette ? (
          <button
            type="button"
            onClick={onOpenPalette}
            aria-label="Open command palette"
            // Hidden on touch: it advertises a keyboard shortcut that does not
            // exist there, and the strip needs the width more.
            className="mb-1.5 hidden shrink-0 items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent sm:inline-flex"
          >
            ⌘K
          </button>
        ) : null}
        {onNewTab ? (
          <button
            type="button"
            onClick={onNewTab}
            className="mb-1.5 inline-flex shrink-0 items-center gap-1 rounded border border-accent/50 px-2 py-0.5 font-mono text-[10px] text-accent transition-colors hover:bg-accent/10"
          >
            + new tab
          </button>
        ) : null}
      </nav>
      <NavProgress active={navigating} />
    </div>
  );
}

type StripTab = { label: string; short: string; to: string };

function TabLink({
  tab,
  entering = false,
  closing = false,
  spinning = false,
}: {
  tab: StripTab;
  /** Newly opened session tab: grows into the strip once, on mount. */
  entering?: boolean;
  /** Being replaced: shrinks away, then is unmounted by the parent. */
  closing?: boolean;
  /** Active tab during a navigation: the dot becomes a favicon spinner. */
  spinning?: boolean;
}) {
  const motion = closing
    ? " animate-tab-close pointer-events-none"
    : entering
      ? " animate-tab-open"
      : "";
  return (
    <Link
      to={tab.to}
      activeOptions={{ exact: true }}
      tabIndex={closing ? -1 : undefined}
      aria-hidden={closing ? true : undefined}
      className={
        "group flex shrink-0 items-center gap-2 rounded-t-md border border-b-0 border-transparent px-2.5 py-1.5 font-mono text-[11px] tracking-tight text-muted-foreground transition-colors hover:text-muted-foreground data-[status=active]:border-border data-[status=active]:bg-background data-[status=active]:text-accent sm:px-3" +
        motion
      }
    >
      {spinning ? (
        <span
          aria-hidden
          className="h-1.5 w-1.5 shrink-0 rounded-full border border-accent border-t-transparent motion-safe:animate-spin"
        />
      ) : (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/30 transition-colors group-data-[status=active]:bg-accent" />
      )}
      {/* The tab you are on always shows its real name; the others shrink to an
          abbreviation on narrow screens so they fit. */}
      <span className="hidden max-w-[10rem] truncate group-data-[status=active]:inline sm:inline">
        {tab.label}
      </span>
      <span className="max-w-[4.5rem] truncate group-data-[status=active]:hidden sm:hidden">
        {tab.short}
      </span>
    </Link>
  );
}
