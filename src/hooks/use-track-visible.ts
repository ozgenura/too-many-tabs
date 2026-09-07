import { useEffect, useRef } from "react";

import { track, type EventName } from "@/lib/analytics";

/**
 * Fires an event the first time the element is meaningfully on screen, once per
 * page load. Used to tell "landed on the homepage" apart from "actually
 * scrolled far enough to see the projects".
 */
export function useTrackVisible<T extends HTMLElement>(name: EventName) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        track(name);
      },
      {
        // threshold 0, not a fraction: a section taller than the viewport can
        // never expose 25% of itself, so any fractional threshold silently
        // never fires — worst on the small screens that matter most. The
        // negative bottom margin is what keeps a one-pixel sliver from
        // counting as "seen".
        threshold: 0,
        rootMargin: "0px 0px -120px 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [name]);

  return ref;
}
