export type NoteEntry = {
  date: string;
  title: string;
  body: string;
};

export const notesIntro = "// notes, half-formed thoughts, things I'm reading";
export const notesOutro = "— end of file (for now)";

/** Pulls "## <date> — <title>" sections (and their markdown bodies) out of notes.md. */
export function parseNotes(source: string): NoteEntry[] {
  // Normalize first: on a CRLF checkout every line would keep a trailing \r,
  // which `.` never matches, so the heading regex below would silently find
  // nothing and the whole devlog would render empty.
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const entries: NoteEntry[] = [];
  let current: NoteEntry | null = null;
  const buffer: string[] = [];

  const flush = () => {
    if (!current) return;
    const body = buffer
      .join("\n")
      .replace(/^\s*---\s*$/gm, "")
      .trim();
    entries.push({ ...current, body });
    buffer.length = 0;
  };

  for (const line of lines) {
    const match = /^##\s+(.*)$/.exec(line);
    if (match) {
      flush();
      const heading = match[1]!.trim();
      const split = heading.split(/\s+—\s+/);
      current =
        split.length > 1
          ? { date: split[0]!.trim(), title: split.slice(1).join(" — ").trim(), body: "" }
          : { date: "", title: heading, body: "" };
      continue;
    }
    if (current) buffer.push(line);
  }
  flush();

  return entries.map((entry) => ({
    ...entry,
    body: entry.body.replace(new RegExp(`${escapeRe(notesOutro)}\\s*$`), "").trim(),
  }));
}

/**
 * A one-line, plain-text preview of a note body, for the homepage teaser.
 * Drops code blocks entirely — a fenced snippet makes a useless excerpt — and
 * unwraps the rest of the markdown rather than showing its syntax.
 */
export function excerpt(body: string, max = 130): string {
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*(?:[>\-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const clipped = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  // Drop trailing punctuation so the ellipsis doesn't read as "now.…".
  return `${clipped.trimEnd().replace(/[.,;:!?—-]+$/, "")}…`;
}

function escapeRe(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The heading line a note renders as. Single source of truth: the notes page
 * derives its anchor ids from this string, so anything linking to an entry has
 * to build the slug from the same text.
 */
export function noteHeading(entry: NoteEntry): string {
  const date = entry.date.trim();
  const title = entry.title.trim();
  return date ? `${date} — ${title}` : title;
}

/** Rebuilds the markdown document the notes page renders. */
export function serializeNotes(entries: NoteEntry[]): string {
  const blocks = entries
    .filter((entry) => entry.title.trim() || entry.body.trim())
    .map((entry) => `## ${noteHeading(entry)}\n\n${entry.body.trim()}`);

  return [`${notesIntro}\n`, ...blocks, notesOutro].join("\n\n---\n\n");
}
