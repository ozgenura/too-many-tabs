import { useEffect, useState } from "react";

/** Left over from when this was persisted; cleared so it stops confusing anyone. */
const RETIRED_STORAGE_KEY = "tmt:boring";

let current = false;
const listeners = new Set<(v: boolean) => void>();

function apply(on: boolean) {
  document.documentElement.classList.toggle("boring", on);
}

export function setBoringMode(next: boolean) {
  current = next;
  apply(next);
  listeners.forEach((l) => l(next));
}

/**
 * "Boring mode": renders the site as a flat, traditional, print-friendly page.
 *
 * Deliberately **not persisted**. It used to live in localStorage, which meant
 * someone who tried it once got the boring version forever — including on a
 * visit weeks later, where they would never see the actual site again. It is a
 * mode you switch into, not a preference you set.
 *
 * Module state, so it survives client-side navigation for the whole visit and
 * resets on a real page load. Theme and late-night stay in localStorage; those
 * are preferences.
 */
export function useBoringMode() {
  const [on, setLocal] = useState(current);

  useEffect(() => {
    try {
      window.localStorage.removeItem(RETIRED_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    apply(current);
    setLocal(current);

    const l = (v: boolean) => setLocal(v);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  return [on, setBoringMode] as const;
}
