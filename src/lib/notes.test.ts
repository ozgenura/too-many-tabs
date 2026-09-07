import { describe, expect, it } from "vitest";

import { excerpt, noteHeading, parseNotes, serializeNotes } from "./notes";
import notesSource from "@/content/notes.md?raw";

const SAMPLE = [
  "// intro line",
  "",
  "---",
  "",
  "## 2026-09-03 — new tab: /audio",
  "",
  "Body text.",
  "",
  "---",
  "",
  "## 2026-08-21 — columns that were opinions",
  "",
  "Another body.",
].join("\n");

describe("parseNotes", () => {
  it("reads the date and title out of each heading", () => {
    const entries = parseNotes(SAMPLE);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ date: "2026-09-03", title: "new tab: /audio" });
    expect(entries[1]?.body).toBe("Another body.");
  });

  it("parses identically on a CRLF checkout", () => {
    // Regression: `.` never matches \r, so a CRLF source used to leave every
    // heading unmatched and the devlog silently rendered empty.
    expect(parseNotes(SAMPLE.replace(/\n/g, "\r\n"))).toEqual(parseNotes(SAMPLE));
  });

  it("keeps a title that contains the em dash separator", () => {
    const entries = parseNotes("## 2026-01-01 — a title — with a dash\n\nBody.");
    expect(entries[0]?.title).toBe("a title — with a dash");
  });

  it("survives a round trip through serializeNotes", () => {
    expect(parseNotes(serializeNotes(parseNotes(SAMPLE)))).toEqual(parseNotes(SAMPLE));
  });
});

describe("excerpt", () => {
  it("returns short bodies untouched", () => {
    expect(excerpt("A short note.")).toBe("A short note.");
  });

  it("unwraps markdown instead of showing its syntax", () => {
    expect(excerpt("Half the columns were **opinions**, see [the note](https://x.dev).")).toBe(
      "Half the columns were opinions, see the note.",
    );
  });

  it("drops fenced code, which makes a useless preview", () => {
    expect(excerpt("Twelve lines:\n\n```ts\nconst a = 1;\n```\n\nThat's it.")).toBe(
      "Twelve lines: That's it.",
    );
  });

  it("cuts on a word boundary and does not double up punctuation", () => {
    const long = "Turns out I don't do just curious halfway, there is a whole folder of drafts now.";
    const result = excerpt(long, 40);
    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toMatch(/[.,;:]…$/);
    expect(result.length).toBeLessThanOrEqual(41);
  });
});

describe("noteHeading", () => {
  it("matches what serializeNotes writes, so anchors line up", () => {
    const entry = { date: "2026-09-03", title: "new tab: /audio", body: "x" };
    expect(serializeNotes([entry])).toContain(`## ${noteHeading(entry)}`);
  });

  it("falls back to the title when a note has no date", () => {
    expect(noteHeading({ date: "", title: "untitled", body: "" })).toBe("untitled");
  });
});

describe("the real notes.md", () => {
  it("parses into dated entries", () => {
    const entries = parseNotes(notesSource);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.title.trim()).not.toBe("");
    }
  });
});
