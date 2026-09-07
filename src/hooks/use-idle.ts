import { useEffect, useRef, useState } from "react";
import { IDLE_TIMEOUT_MS } from "@/lib/egg-config";
import { notifyEgg } from "@/lib/egg-events";
import { useEggSettings } from "./use-egg-settings";

export { IDLE_TIMEOUT_MS };

const EVENTS = ["mousemove", "mousedown", "click", "keydown", "scroll", "touchstart", "wheel"] as const;

/**
 * Tracks user inactivity. After the configured idle timeout with no
 * interaction the document gets a `tab-sleeping` class (used for a gentle
 * accent dim) and this hook returns true. Any interaction wakes it back up.
 *
 * The timeout comes from the live egg settings, so changing it in the settings
 * panel takes effect immediately.
 */
export function useIdle() {
  const [idle, setIdle] = useState(false);
  const { effective } = useEggSettings();
  const timeout = effective.idleTimeoutMs;
  const enabled = effective.idleEnabled;
  const announced = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setIdle(false);
      document.documentElement.dataset["hydrated"] = "1";
      return;
    }
    let timer: number | undefined;

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), timeout);
    };

    const wake = () => {
      setIdle((was) => (was ? false : was));
      schedule();
    };

    schedule();
    // Marker so e2e tests can wait for the idle timer to be registered.
    document.documentElement.dataset["hydrated"] = "1";
    EVENTS.forEach((evt) =>
      window.addEventListener(evt, wake, { passive: true } as AddEventListenerOptions),
    );

    return () => {
      window.clearTimeout(timer);
      EVENTS.forEach((evt) => window.removeEventListener(evt, wake));
    };
  }, [timeout, enabled]);

  useEffect(() => {
    document.documentElement.classList.toggle("tab-sleeping", idle);
    if (idle && !announced.current) {
      announced.current = true;
      notifyEgg(
        "tab-sleeping",
        "easter egg: tab sleeping",
        `idle for ${Math.round(timeout / 1000)}s · move or press a key to wake`,
      );
    }
    if (!idle) announced.current = false;
    return () => document.documentElement.classList.remove("tab-sleeping");
  }, [idle, timeout]);

  return idle;
}
