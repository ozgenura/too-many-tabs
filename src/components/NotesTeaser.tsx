import { Link } from "@tanstack/react-router";

import { notes } from "@/data/site";
import { excerpt, noteHeading } from "@/lib/notes";
import { slugify } from "@/components/Markdown";

const SHOWN = 2;

/**
 * The other half of the shelf.
 *
 * The project grid shows what got built; this shows how the thinking runs while
 * it is being built — which is the part that reads as expertise rather than
 * output. notes.md already holds it, it just had no entrance from the homepage.
 */
export function NotesTeaser() {
  const latest = notes.slice(0, SHOWN);
  if (latest.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-8 sm:pb-32">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          notes.md
        </h2>
        <Link
          to="/notes"
          className="font-mono text-[11px] text-muted-foreground transition-colors hover:text-accent"
        >
          read the file <span aria-hidden>→</span>
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-border/50 border-y border-border/50">
        {latest.map((note) => (
          <li key={`${note.date}-${note.title}`}>
            <Link
              to="/notes"
              hash={slugify(noteHeading(note))}
              className="group flex flex-col gap-1.5 py-5 transition-colors sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="shrink-0 font-mono text-[11px] text-subtle sm:w-24">
                {note.date}
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[13px] text-foreground transition-colors group-hover:text-accent">
                  {note.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {excerpt(note.body)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
