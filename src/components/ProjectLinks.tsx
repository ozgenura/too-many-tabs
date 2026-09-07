import { ArrowUpRight } from "lucide-react";
import type { ProjectLink } from "@/data/projects";

/**
 * Outbound links for a project. Rendered only on the detail page — the grid
 * cards are themselves links, and an anchor inside an anchor is invalid markup
 * and unusable with a keyboard.
 */
export function ProjectLinks({
  links,
  className = "",
}: {
  links: ProjectLink[] | undefined;
  className?: string;
}) {
  if (!links?.length) return null;

  return (
    <nav aria-label="Project links" className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map((link, i) => {
        const primary = i === 0;
        return (
          <a
            // Index, not url: two links may legitimately point at the same
            // place (a repo that is also the writeup), and a duplicate React
            // key silently drops one of them.
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={
              "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] tracking-tight transition-colors " +
              (primary
                ? "border-accent/60 text-accent hover:bg-accent/10"
                : "border-border text-muted-foreground hover:border-accent/50 hover:text-accent")
            }
          >
            {link.label}
            <ArrowUpRight
              aria-hidden="true"
              className="h-3 w-3 shrink-0 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
            />
          </a>
        );
      })}
    </nav>
  );
}
