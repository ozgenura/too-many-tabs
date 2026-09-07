import { createFileRoute, Link } from "@tanstack/react-router";
import { PageFrame } from "@/components/PageFrame";
import {
  FEATURED_LIMIT,
  byTabNumberDesc,
  projects as allProjects,
  statusDot,
  statusStyles,
} from "@/data/projects";
import { TabNumberLabel } from "@/components/TabNumberLabel";
import { track } from "@/lib/analytics";

const title = "chrome://tabs — Too Many Tabs";
const description =
  "The full archive of tabs: every project, shipped or still open, with status, stack and a one-line summary.";

export const Route = createFileRoute("/all-projects")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AllProjectsPage,
});

function AllProjectsPage() {
  const projects = [...allProjects].sort(byTabNumberDesc);
  const featured = Math.min(
    projects.filter((p) => p.featured !== false).length,
    FEATURED_LIMIT,
  );

  return (
    <PageFrame>
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-8 sm:py-28">
        <h1 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">chrome://tabs</h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Every tab in the archive — including the ones that never made it to the homepage.
        </p>
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          {projects.length} projects · {featured} on the homepage ·{" "}
          {projects.length - featured} archive only
        </p>

        <ol className="mt-12 space-y-8 border-t border-border/60 pt-8">
          {projects.map((project) => (
            <li key={project.slug} className="border-b border-border/60 pb-8 last:border-b-0">
              <Link
                to="/projects/$slug"
                params={{ slug: project.slug }}
                onClick={() => track("project_open", { slug: project.slug, from: "archive" })}
                className="group block"
              >
                <h2 className="flex flex-wrap items-baseline gap-2 leading-tight">
                  <TabNumberLabel
                    project={project}
                    asLink={false}
                    className="text-sm"
                  />
                  <span className="font-mono text-sm text-muted-foreground" aria-hidden="true">
                    —
                  </span>
                  <span className="font-serif text-xl text-foreground transition-colors group-hover:text-accent sm:text-2xl">
                    {project.name}
                  </span>
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {project.blurb}
                </p>
                {project.solved[0] ? (
                  <p className="mt-2 flex max-w-2xl gap-2 font-mono text-[11px] leading-5 text-accent/90">
                    <span aria-hidden className="text-accent/60">
                      →
                    </span>
                    <span>{project.solved[0]}</span>
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span
                    className={
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider " +
                      statusStyles[project.status]
                    }
                  >
                    <span
                      aria-hidden
                      className={"h-1.5 w-1.5 rounded-full " + statusDot[project.status]}
                    />
                    {project.status}
                  </span>
                  <ul className="flex flex-wrap gap-1.5">
                    {project.stack.map((item) => (
                      <li
                        key={item}
                        className="rounded border border-border/70 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-accent">
                    open →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </PageFrame>
  );
}
