import notesSource from "@/content/notes.md?raw";
import { parseNotes, type NoteEntry } from "@/lib/notes";

/**
 * The "build without ___" variants the hero rotates through.
 *
 * **The first entry is the anchor** — the hero starts there on every load and
 * the rotation continues from it. Reorder this and the title, og:title and
 * first paint all move together.
 */
export const taglineWords = ["guesswork", "red tape", "noise", "hesitation"] as const;

/**
 * The single variant that anchors the brand *outside* the page — <title>,
 * og:title, bios. Rotation is an on-page effect; a search result or a link
 * preview only ever gets one line, so it has to be the same one every time.
 */
export const tagline = `build without ${taglineWords[0]}`;

export const nowLines = [
  "building a make-vs-buy model, watching four tenders try to beat a number they don't know",
  "reading about small models that run on boring hardware",
  "writing notes.md more often than I ship anything",
];

export const stack: { label: string; items: string }[] = [
  { label: "data", items: "SQL, Python, Power BI · loading: Microsoft Fabric" },
  { label: "build", items: "vibecoded — Lovable, Claude Code, whatever ships fastest" },
  { label: "think", items: "voice notes, open tabs — like a lot, sleepless nights" },
  { label: "ship", items: "git, vercel-ish things, patience" },
];

export const closedTabs = [
  "a browser extension that closes tabs for me",
  "a second newsletter, before finishing the first one",
  "an invoice ocr thing that three services already do better",
  "a dashboard nobody asked for, including me",
  "a tab I swear I closed",
];

/**
 * Routed through Cloudflare Email Routing to a personal inbox. Receive-only:
 * nothing on the site sends from this address.
 */
export const contactEmail = "hello@toomanytabs.dev";

/**
 * The name and the one line that goes with the portrait on about:me.
 *
 * The site talks about the work everywhere and never says who is doing it.
 * Someone who wants to hire or book you has to be able to leave with a name.
 */
export const authorName = "Özgenur Acun";
export const authorLine = "procurement excellence · istanbul";

export const aboutIntro = [
  "By day I work in procurement excellence: reading spend data, taking processes apart to see what is actually load-bearing, and proposing the changes worth making. Most of what I build starts right there — a report that took too long, a number nobody could explain, a process held together by copy-paste.",
  "Evenings are the other half, and they are not a side effect of the day job — they are where I learn things, run experiments, and build. Small models, local tools, quick scripts that save an hour a week. I'd rather ship something rough that works than plan something perfect that never opens.",
  "So the tabs stay open. Some become projects, some become notes, most stay questions. That's the whole system.",
];

export const aboutTimeline: { when: string; what: string }[] = [
  { when: "by day", what: "procurement excellence — spend analysis, process work, improvements" },
  { when: "by night", what: "learning, experiments, and building the things on this shelf" },
  { when: "before", what: "supplier and category work inside larger operations teams" },
  { when: "always", what: "taking apart processes to see what's actually load-bearing" },
];

export const aboutFacts: { label: string; value: string }[] = [
  { label: "based in", value: "istanbul, mostly" },
  { label: "works on", value: "procurement excellence — spend data, process, improvement" },
  { label: "open to", value: "consulting, teaching, collaborations, weird ideas" },
  { label: "tabs open", value: "more than I'll admit" },
];

// --- derived content -------------------------------------------------------

/**
 * notes.md is the source of truth for the devlog. Parsed once at module load so
 * every surface (the /notes page, the footer date) reads the same entries.
 */
export const notes: NoteEntry[] = parseNotes(notesSource);

/**
 * Site-wide "last touched" date, taken from the newest dated note. Notes are the
 * thing that changes most often, so this stays honest without anyone updating it
 * by hand.
 */
export const lastUpdated: string | null =
  notes
    .map((entry) => entry.date)
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort()
    .at(-1) ?? null;

/** Site-wide date label, e.g. "September 2026". */
export function formatSiteDate(iso: string | null): string {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
