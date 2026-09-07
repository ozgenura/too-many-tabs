import { useState } from "react";
import type { Screenshot } from "@/data/projects";

type ProjectScreenshotProps = {
  slug: string;
  name: string;
  screenshots?: Screenshot[] | undefined;
  className?: string;
  aspect?: string;
  /** Show the mini tab switcher inside the chrome header (detail pages). */
  switcher?: boolean;
};

export function ProjectScreenshot({
  slug,
  name,
  screenshots = [],
  className = "",
  aspect = "aspect-[16/10]",
  switcher = false,
}: ProjectScreenshotProps) {
  const [active, setActive] = useState(0);
  const shots = screenshots.slice(0, 3);
  const showTabs = switcher && shots.length > 1;
  const current = shots[Math.min(active, Math.max(shots.length - 1, 0))];

  return (
    <figure
      className={
        "overflow-hidden rounded-b-lg rounded-tl-lg rounded-tr-3xl border border-border bg-card " +
        className
      }
    >
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-1.5">
        {showTabs ? (
          <nav aria-label={`${name} screenshots`} className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {shots.map((shot, i) => (
              <button
                key={shot.url + i}
                type="button"
                onClick={() => setActive(i)}
                aria-current={i === active ? "true" : undefined}
                className={
                  "flex shrink-0 items-center gap-1.5 rounded-t px-2 py-0.5 font-mono text-[10px] transition-colors " +
                  (i === active ? "text-accent" : "text-muted-foreground hover:text-accent")
                }

              >
                <span
                  className={
                    "h-1 w-1 shrink-0 rounded-full " +
                    (i === active ? "bg-accent" : "bg-muted-foreground/40")
                  }
                  aria-hidden="true"
                />
                <span className="max-w-[7rem] truncate">{shot.label}</span>
              </button>
            ))}
          </nav>
        ) : (
          <>
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40"
              aria-hidden="true"
            />
            <span className="min-w-0 truncate font-mono text-[10px] text-muted-foreground">
              {slug}.app
            </span>
          </>
        )}
      </div>
      <div className={"relative w-full bg-card " + aspect}>
        {current ? (
          shots.map((shot, i) => (
            <img
              key={shot.url + i}
              src={shot.url}
              alt={`${name} — ${shot.label}`}
              loading="lazy"
              className={
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-300 " +
                (i === active ? "opacity-100" : "opacity-0")
              }
              aria-hidden={i === active ? undefined : true}
            />
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[11px] text-muted-foreground">screenshot pending</span>
          </div>
        )}
      </div>
    </figure>
  );
}
