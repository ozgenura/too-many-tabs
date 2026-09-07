/**
 * The tabs that are always open.
 *
 * Deliberately short: the strip shares its width with the theme toggles and the
 * new-tab button, and once it overflows the browser-chrome illusion turns into
 * a scrollbar. Anything that is a detour rather than a destination lives in
 * TabStrip's `sessionTabs` instead — it appears once you find it.
 */
export const tabs = [
  { label: "too-many-tabs", to: "/" },
  { label: "work", to: "/work" },
  { label: "notes.md", to: "/notes" },
  // Always open: it is the shopfront for whatever is in progress, not a detour.
  { label: "localhost:5173", to: "/localhost" },
  { label: "about:me", to: "/about" },
] as const;
