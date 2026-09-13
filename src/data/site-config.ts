/**
 * Canonical origin for absolute URLs (canonical links, og:url, sitemap).
 *
 * Set VITE_SITE_URL per environment; the fallback is the production domain so
 * a build without the variable still emits correct absolute URLs rather than
 * localhost ones.
 */
export const SITE_URL = (
  import.meta.env["VITE_SITE_URL"] ?? "https://toomanytabs.dev"
).replace(/\/$/, "");

/** The site's name, as it appears in titles and og:site_name. */
export const SITE_NAME = "Too Many Tabs";

/** Social preview card. 1200x630, served from public/. */
export const OG_IMAGE = "/og.png";

/**
 * Search engines are opted *out* by default: an accidental index is expensive
 * to undo, so a build has to ask for it. Production has asked since the launch
 * build of 2026-09-13; `.env.example` stays "false" so nobody's local or forked
 * build quietly competes with the real site for the same pages.
 *
 * Turning this on does not index everything. Pages that opt out for their own
 * reasons — /localhost, /incognito, /err-too-many-tabs — set their own robots
 * meta and are absent from sitemap.xml.
 */
export const INDEXING_ENABLED = import.meta.env["VITE_ALLOW_INDEXING"] === "true";

/**
 * Cloudflare Web Analytics beacon token — traffic and Core Web Vitals, no
 * cookies. Public by design (it ships in the page HTML); it identifies the
 * site, not a visitor.
 *
 * Tied to the hostname registered in the Cloudflare dashboard, so moving to a
 * real domain means registering that hostname there and updating this.
 */
export const CF_ANALYTICS_TOKEN = "ebec803c0297439686fbd896cf7186c3";

/** Builds an absolute URL from a site-root-relative path. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
