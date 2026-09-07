/**
 * A handful of named events, written straight into the site's own database.
 *
 * Not a general analytics product: it answers five specific questions about
 * whether the page works — do people reach the projects, do they open one, do
 * they find the palette, do they write anything — and nothing else. Cloudflare
 * Web Analytics covers plain traffic and Core Web Vitals on top of this.
 *
 * No cookies, no IP, no fingerprint, nothing that survives closing the tab, so
 * there is nothing to put behind a consent banner.
 */

const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"];
const SUPABASE_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

export type EventName =
  | "page_view"
  /** The project grid scrolled into view — i.e. the proof was actually reached. */
  | "projects_seen"
  | "project_open"
  | "palette_open"
  | "notify_submit"
  | "inquiry_submit"
  | "egg_triggered";

const SESSION_KEY = "tmt:sid";

/**
 * Random per-tab id, so "landed" and "opened a project" can be tied into one
 * visit. Lives in sessionStorage: it dies with the tab and never identifies a
 * person or links two visits together.
 */
function sessionId(): string | null {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Private mode or storage blocked — send the event without a session.
    return null;
  }
}

function enabled(): boolean {
  if (typeof window === "undefined") return false;
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;
  // Keep development traffic out of the real numbers.
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return false;
  if (window.navigator.doNotTrack === "1") return false;
  return true;
}

/**
 * Fire-and-forget. Never rejects and never blocks a click: `keepalive` lets the
 * request outlive the page when the event is the navigation itself.
 *
 * (sendBeacon would be the usual tool here, but it cannot set the `apikey`
 * header PostgREST requires.)
 */
export function track(name: EventName, meta?: Record<string, unknown>): void {
  if (!enabled()) return;

  try {
    void fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: SUPABASE_KEY as string,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name,
        path: window.location.pathname,
        session_id: sessionId(),
        meta: meta ?? null,
      }),
    }).catch(() => {
      // Analytics must never surface in the UI.
    });
  } catch {
    /* ignore */
  }
}
