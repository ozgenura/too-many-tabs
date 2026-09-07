import { useEffect } from "react";
import { useEggSettings } from "@/hooks/use-egg-settings";
import { notifyEgg } from "@/lib/egg-events";

let printed = false;
let announced = false;

/** Test-only: re-arm the once-per-load guards. */
export function __resetConsoleEgg() {
  printed = false;
  announced = false;
}

/**
 * Browsers expose no "DevTools is open" signal, so we infer it: a logged object
 * only has its properties read when the console actually renders it, which for
 * a buffered entry is the moment the panel opens.
 *
 * The getter can also fire immediately at log time in some browsers, which
 * would announce the egg to everyone on every page load. So anything that
 * fires in the first second is treated as the console echoing, not opening.
 */
function watchForConsoleOpen() {
  const openedAt = Date.now();
  const probe = {
    get _() {
      if (announced) return "";
      if (Date.now() - openedAt < 1000) return "";
      announced = true;
      notifyEgg("console", "easter egg: console", "you opened the console. of course you did.");
      return "";
    },
  };
  console.log(probe);
}

// Aligned for monospace: each line steps 1 col left and grows 2 cols wider,
// so the slanted sides meet the rounded top and the flat base cleanly.
const ART = [
  "    ╭────────────────────────╮",
  "   ╱     ● too many tabs      ╲",
  "  ╱────────────────────────────╲",
].join("\n");

const BASE =
  "font-family: ui-monospace, 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.35;";

/**
 * Writes the styled egg into the console buffer exactly once per page load, so
 * it is already sitting there whenever someone opens DevTools. (Browsers give
 * no reliable DevTools-open signal, so we pre-seed the buffer instead.)
 */
export function printConsoleEgg() {
  if (printed) return false;
  printed = true;
  console.log(`%c${ART}`, `${BASE} color: #f0a24a;`);
  console.log(
    "%c// you opened the console. of course you did. — too many tabs, probably in this one too.",
    `${BASE} color: #9a9a94;`,
  );
  return true;
}

export function ConsoleEgg() {
  const { effective } = useEggSettings();
  const enabled = effective.consoleEnabled;

  useEffect(() => {
    if (!enabled) return;
    if (printConsoleEgg()) watchForConsoleOpen();
  }, [enabled]);

  return null;
}
