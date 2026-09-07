import { Link } from "@tanstack/react-router";
import { hasTabNumber, openedYear, tabLabel, type Project } from "@/data/projects";

const base = "font-mono text-[11px] text-muted-foreground transition-colors hover:text-accent";

type Props = {
  project: Pick<Project, "slug" | "tabNumber" | "openedAt">;
  /** When false, renders plain text (use inside an existing link). */
  asLink?: boolean;
  className?: string;
};

/** Consistent, clickable "Tab #N · 2025" archive label. Flags missing numbers as "Tab #—". */
export function TabNumberLabel({ project, asLink = true, className = "" }: Props) {
  const missing = !hasTabNumber(project);
  const label = tabLabel(project);
  const year = openedYear(project);
  const cls = `${base} ${missing ? "italic opacity-70" : ""}`.trim();
  const title = missing ? "No archive number assigned" : label;

  const number = !asLink ? (
    <span className={cls} title={title} aria-label={label} role="note">
      {label}
    </span>
  ) : (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className={cls}
      title={title}
      aria-label={label}
      onKeyDown={(event) => {
        // Links only activate on Enter natively; support Space too.
        if (event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
    >
      {label}
    </Link>
  );

  // The year sits outside the link: it is context, not a second thing to click.
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`.trim()}>
      {number}
      {year ? (
        <span className="font-mono text-[11px] text-subtle">
          <span aria-hidden>·</span> <span className="sr-only">opened</span>
          {year}
        </span>
      ) : null}
    </span>
  );
}
