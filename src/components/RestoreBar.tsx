import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { projects } from "@/data/projects";

const DISMISS_KEY = "tmt:restore-dismissed";

/**
 * The browser's "restore previous session?" prompt, counting the tabs that are
 * still open.
 *
 * It used to scroll to the homepage grid, which is the wrong place twice over:
 * that grid is a curated four, so it showed shipped projects the bar had not
 * counted, and it omitted unfinished ones that live only in the archive. The
 * archive is the honest destination — restoring a session opens every tab, not
 * a selection.
 */
export function RestoreBar() {
  const [dismissed, setDismissed] = useState(false);
  const unfinished = projects.filter(
    (p) => p.status === "in progress" || p.status === "draft",
  ).length;

  // Per session, like the browser prompt it is imitating: dismissing it once
  // should not mean seeing it again on the next page.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      /* storage blocked — the bar just stays dismissable in memory */
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (dismissed || unfinished === 0) return null;

  return (
    <div className="border-b border-border/50 bg-secondary/25">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2 sm:px-8">
        <p className="min-w-0 truncate font-mono text-[11px] text-muted-foreground">
          you have {unfinished} unfinished {unfinished === 1 ? "tab" : "tabs"}{" "}
          <span className="text-muted-foreground">·</span>{" "}
          <Link
            to="/all-projects"
            className="text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent"
          >
            restore?
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          ×
        </button>
      </div>
    </div>
  );
}
