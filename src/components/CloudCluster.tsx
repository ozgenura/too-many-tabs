import { useEffect, useState } from "react";
import { SPRITE_PROBABILITY } from "@/lib/egg-config";
import { notifyEgg } from "@/lib/egg-events";
import { useEggSettings } from "@/hooks/use-egg-settings";

export { SPRITE_PROBABILITY };

const DRIFT_DURATION_MS = 10_000;
const CAPTION_DURATION_MS = 7_500;

export const CLOUD_CAPTIONS = [
  "backed up to the cloud. probably.",
  "still syncing. it's fine.",
  "somewhere in here is your data.",
];

let tuningKey: string | null = null;
let shownThisSession = false;

/** Test-only: allow re-arming the once-per-session guard. */
export function __resetSpriteGuard() {
  tuningKey = null;
  shownThisSession = false;
}

/** One 8-bit style cloud: stacked blocks, amber at reduced opacity. */
function PixelCloud({ scale = 1, className = "" }: { scale?: number; className?: string }) {
  const u = 8 * scale; // one "pixel" unit
  const px = (n: number) => `${n * u}px`;
  return (
    <div className={`flex flex-col items-center ${className}`} style={{ imageRendering: "pixelated" }}>
      <div className="bg-accent" style={{ width: px(2), height: px(1), marginLeft: px(0) }} />
      <div className="bg-accent" style={{ width: px(4), height: px(1) }} />
      <div className="bg-accent" style={{ width: px(6), height: px(1) }} />
      <div className="bg-accent" style={{ width: px(5), height: px(1), marginRight: px(1) }} />
    </div>
  );
}

/**
 * A small cluster of pixel-art clouds that drifts across the upper portion of
 * the page once, with a short "the cloud" caption. Purely decorative.
 *
 * Rolled once per navigation and shown at most once per session, so a long
 * visit is likely to catch it and a short one probably will not — rare enough
 * to feel like luck, common enough to actually happen.
 *
 * In test mode the roll is re-armed whenever the probability changes, so it can
 * be summoned on demand from the settings panel.
 */
export function CloudCluster({ routeKey }: { routeKey?: string }) {
  const [visible, setVisible] = useState(false);
  const [captionVisible, setCaptionVisible] = useState(false);
  const [caption, setCaption] = useState(CLOUD_CAPTIONS[0]);
  const { settings, effective } = useEggSettings();
  const probability = effective.spriteProbability;
  const testMode = settings.testMode;
  const enabled = effective.spriteEnabled;

  useEffect(() => {
    if (!enabled) return;

    // Re-arm when the tunables change (the settings panel), so a new
    // probability takes effect without a reload.
    const key = `${probability}|${testMode}`;
    if (tuningKey !== key) {
      tuningKey = key;
      shownThisSession = false;
    }

    // The dice used to be rolled once per module load. In a single-page app
    // that is once per *session*, so browsing twenty pages gave exactly the
    // same odds as opening one — and the egg went unseen for entire days.
    // Now every navigation is a fresh roll, and the first hit ends it.
    if (shownThisSession) return;
    // Reduced motion no longer skips the egg. It used to return here, which
    // meant anyone with the OS setting on could never see it at any
    // probability — and the site looked like it had nothing hidden in it.
    // The CSS decides how it arrives: it drifts, or it just fades in.
    if (Math.random() > probability) return;

    const start = window.setTimeout(
      () => {
        shownThisSession = true;
        setCaption(CLOUD_CAPTIONS[Math.floor(Math.random() * CLOUD_CAPTIONS.length)]);
        setVisible(true);
        setCaptionVisible(true);
        notifyEgg("sprite", "easter egg: cloud cluster", "a few clouds are drifting by");
      },
      testMode ? 400 : 2500,
    );
    return () => window.clearTimeout(start);
  }, [probability, testMode, enabled, routeKey]);

  useEffect(() => {
    if (!visible) return;
    const hideCaption = window.setTimeout(() => setCaptionVisible(false), CAPTION_DURATION_MS);
    const done = window.setTimeout(() => setVisible(false), DRIFT_DURATION_MS);
    return () => {
      window.clearTimeout(hideCaption);
      window.clearTimeout(done);
    };
  }, [visible]);

  if (!visible || !enabled) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="cloud-cluster"
      className="pointer-events-none fixed left-0 top-16 z-30 animate-cloud-drift select-none opacity-50 sm:top-24"
    >
      <div className="flex items-end gap-3 sm:gap-5">
        <PixelCloud scale={0.75} className="sm:hidden" />
        <PixelCloud scale={0.55} className="mb-2 sm:hidden" />
        <PixelCloud scale={0.6} className="hidden sm:flex" />
        <PixelCloud scale={1} className="hidden sm:flex" />
        <PixelCloud scale={0.7} className="mb-3 hidden sm:flex" />
      </div>
      <p
        data-testid="cloud-cluster-caption"
        className={`mt-2 pl-1 font-mono text-[11px] text-muted-foreground transition-opacity duration-1000 ${
          captionVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {caption}
      </p>
    </div>
  );
}
