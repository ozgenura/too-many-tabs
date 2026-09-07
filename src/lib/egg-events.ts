import { track } from "./analytics";

/**
 * Tiny pub/sub so easter eggs can announce themselves to the on-screen status
 * notifier without prop-drilling through the page frame.
 */
export type EggEvent = {
  id: number;
  egg: "tab-sleeping" | "sprite" | "console" | "game" | "late-night" | "panic";
  message: string;
  detail?: string;
};

type Listener = (event: EggEvent) => void;

const listeners = new Set<Listener>();
let nextId = 1;

export function notifyEgg(egg: EggEvent["egg"], message: string, detail?: string) {
  const event: EggEvent = { id: nextId++, egg, message, ...(detail ? { detail } : {}) };
  // Single choke point for every egg, so "does anyone actually find these?" is
  // answerable without instrumenting each one.
  track("egg_triggered", { egg });
  listeners.forEach((l) => l(event));
  return event;
}

export function subscribeEggEvents(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Test-only. */
export function __resetEggEvents() {
  listeners.clear();
  nextId = 1;
}
