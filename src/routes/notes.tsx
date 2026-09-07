import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageFrame } from "@/components/PageFrame";
import { Markdown, extractHeadings } from "@/components/Markdown";
import { notes } from "@/data/site";
import { serializeNotes } from "@/lib/notes";

const title = "notes.md — Too Many Tabs";
const description =
  "A raw devlog: notes, half-formed thoughts, and things I'm reading while tabs stay open.";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const [query, setQuery] = useState("");
  const notesSource = useMemo(() => serializeNotes(notes), []);
  const headings = useMemo(() => extractHeadings(notesSource), [notesSource]);
  const needle = query.trim().toLowerCase();
  const visibleHeadings = needle
    ? headings.filter((h) => h.text.toLowerCase().includes(needle))
    : headings;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      e.preventDefault();
      document.getElementById("notes-search")?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <PageFrame slashPalette={false}>
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-8 sm:py-28">
        <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          rendering notes.md
        </p>

        <div className="mb-10 rounded-lg border border-border/60 bg-secondary/30 p-4 sm:p-5">
          <label
            htmlFor="notes-search"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            search notes.md
          </label>
          <div className="mt-2 flex items-center gap-2">
            <span aria-hidden className="font-mono text-accent/70">
              /
            </span>
            <input
              id="notes-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter lines, jump to a match…"
              className="w-full bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-accent"
              >
                clear
              </button>
            ) : null}
          </div>

          {visibleHeadings.length > 0 ? (
            <nav aria-label="Table of contents" className="mt-5 border-t border-border/50 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                contents
              </p>
              <ul className="mt-3 space-y-1.5">
                {visibleHeadings.map((h) => (
                  <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 14}px` }}>
                    <a
                      href={`#${h.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        jumpTo(h.id);
                      }}
                      className="font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-accent"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <Markdown source={notesSource} query={query} filter />
      </div>
    </PageFrame>
  );
}
