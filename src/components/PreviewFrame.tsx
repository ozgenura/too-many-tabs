import { useState } from "react";

import type { ProjectPreview } from "@/data/projects";
import { useIsMobile } from "@/hooks/use-mobile";
import { track } from "@/lib/analytics";

/**
 * Mounts a project's live preview in an iframe — but only once the visitor asks.
 *
 * Nothing third-party loads on page view: the page already claims something is
 * compiling with "no output yet", so pressing a button to boot it is both the
 * honest behaviour and the cheap one. It also means a half-finished thing is
 * slow on someone's own terms rather than by ambush.
 *
 * On a narrow screen an iframe of a desktop app is unusable, so there it offers
 * the real thing in a new tab instead of a bad copy in place.
 */
export function PreviewFrame({ preview, name }: { preview: ProjectPreview; name: string }) {
  const [booted, setBooted] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="mt-8">
        <a
          href={preview.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("project_open", { slug: name, from: "localhost-mobile" })}
          className="inline-flex items-center gap-2 rounded-md border border-accent px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent/10"
        >
          <span aria-hidden>$</span> open it in a new tab →
        </a>
        <p className="mt-3 font-mono text-[11px] leading-5 text-muted-foreground">
          it wants a bigger screen than this one.
        </p>
      </div>
    );
  }

  if (!booted) {
    return (
      <div className="mt-8">
        <button
          type="button"
          onClick={() => {
            setBooted(true);
            track("project_open", { slug: name, from: "localhost-boot" });
          }}
          className="inline-flex items-center gap-2 rounded-md border border-accent px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent/10"
        >
          <span aria-hidden>$</span> boot the preview →
        </button>
        <p className="mt-3 font-mono text-[11px] leading-5 text-muted-foreground">
          nothing loads until you press it.
        </p>
      </div>
    );
  }

  return (
    <figure className="mt-8 overflow-hidden rounded-b-lg rounded-tl-lg rounded-tr-3xl border border-border bg-card">
      <figcaption className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        <span className="min-w-0 truncate font-mono text-[10px] text-muted-foreground">
          {preview.url}
        </span>
        <a
          href={preview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground transition-colors hover:text-accent"
        >
          open ↗
        </a>
      </figcaption>
      <iframe
        src={preview.url}
        title={`${name} — live preview`}
        loading="lazy"
        // Enough to run an app, not enough to navigate the page it sits in.
        sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
        referrerPolicy="no-referrer"
        className="block h-[32rem] w-full border-0 bg-background"
      />
    </figure>
  );
}
