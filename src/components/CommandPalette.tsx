import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { contactEmail } from "@/data/site";

type Entry = { label: string; hint: string; go: () => void };

export function CommandPalette({
  open,
  onClose,
  onBookSession,
}: {
  open: boolean;
  onClose: () => void;
  onBookSession?: () => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries: Entry[] = useMemo(
    () => [
      {
        label: "Open Projects",
        hint: "tabs",
        go: () => {
          navigate({ to: "/", hash: "open-tabs" });
          window.setTimeout(
            () => document.getElementById("open-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }),
            60,
          );
        },
      },
      {
        label: "Open Archive",
        hint: "archive",
        go: () => navigate({ to: "/all-projects" }),
      },
      { label: "What I Take On", hint: "work", go: () => navigate({ to: "/work" }) },
      { label: "Read notes.md", hint: "notes", go: () => navigate({ to: "/notes" }) },
      {
        label: "Open press-kit",
        hint: "brand.kit",
        go: () => navigate({ to: "/press-kit" }),
      },
      { label: "About Me", hint: "about:me", go: () => navigate({ to: "/about" }) },
      // Not in the tab strip: these open only once you go looking.
      { label: "Dev Preview", hint: "localhost:5173", go: () => navigate({ to: "/localhost" }) },
      { label: "Untitled Draft", hint: "drafts", go: () => navigate({ to: "/draft" }) },
      {
        label: "Copy Email",
        hint: "clipboard",
        go: () => {
          navigator.clipboard?.writeText(contactEmail).then(
            () => toast("Email copied.", { description: contactEmail }),
            () => {
              window.location.href = `mailto:${contactEmail}`;
            },
          );
        },
      },
      {
        label: "Book a Build Session",
        hint: "new tab",
        go: () => onBookSession?.(),
      },
    ],
    [navigate, onBookSession],
  );

  const needle = query.trim().toLowerCase();
  const results = needle ? entries.filter((e) => e.label.toLowerCase().includes(needle)) : entries;

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [needle]);

  if (!open) return null;

  const run = (entry: Entry | undefined) => {
    if (!entry) return;
    entry.go();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 px-4 pt-24 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card"
      >
        <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
          <span aria-hidden className="font-mono text-xs text-accent/70">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => (results.length ? (i + 1) % results.length : 0));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
              }
              if (e.key === "Enter") {
                e.preventDefault();
                run(results[active]);
              }
            }}
            placeholder="run a command…"
            className="w-full bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">esc</kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto py-2">
          {results.length === 0 ? (
            <li className="px-4 py-3 font-mono text-xs text-muted-foreground">no command by that name.</li>
          ) : (
            results.map((entry, i) => (
              <li key={entry.label}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => run(entry)}
                  className={
                    "flex w-full items-center justify-between gap-4 px-4 py-2 text-left font-mono text-[13px] transition-colors " +
                    (i === active ? "bg-secondary/60 text-accent" : "text-muted-foreground hover:text-foreground")
                  }
                >
                  <span className="truncate">{entry.label}</span>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {entry.hint}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
