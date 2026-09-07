import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

const DURATION_MS = 520;

/**
 * True for a beat after every navigation.
 *
 * Client-side routing here is instant, so there is no real loading state to
 * reflect — and that was the problem: pages replaced each other in complete
 * silence, and the site read as a static document. This is a *transition*
 * signal, not a progress measurement, and nothing presents it as one.
 */
export function useNavPulse(): boolean {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const id = window.setTimeout(() => setActive(false), DURATION_MS);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return active;
}
