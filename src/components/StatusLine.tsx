import { featuredProjects } from "@/data/projects";
import { useLateNight } from "@/hooks/use-late-night";
import { LateNightBadge } from "./LateNightBadge";

export function StatusLine() {
  // "Pinned" means pinned to the homepage — the same thing `featured` controls.
  // It used to count a `pinned` status that nothing had, so this read "0"
  // while the counter directly below claimed otherwise.
  const pinned = featuredProjects.length;
  const night = useLateNight();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8">
      <p className="font-mono text-[10.5px] leading-relaxed text-muted-foreground sm:text-[11px]">
        RAM: 14.2 GB / 16 GB <span className="text-subtle">·</span> {pinned} Pinned Projects{" "}
        <span className="text-subtle">·</span>{" "}
        <span className="text-foreground">
          Available for Consulting &amp; Teaching Work
        </span>
      </p>
      {night ? <LateNightBadge /> : null}
    </div>
  );
}
