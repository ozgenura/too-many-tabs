import { Link } from "@tanstack/react-router";
import { featuredProjects, projects as allProjects } from "@/data/projects";

const summary = "Procurement excellence — spend analysis, process work, and the improvements that follow.";

const bio = [
  "I work in procurement excellence: reading spend data, taking processes apart to find what is actually load-bearing, and proposing the changes worth making. Most of my projects start from a real bottleneck — a report that took too long, or a number nobody could explain.",
  "Alongside that I build small internal tools and data pipelines, and experiment with applied AI where it genuinely saves time. I prefer shipping something simple that works over planning something perfect.",
];

const statusLabel: Record<string, string> = {
  shipped: "Shipped",
  "in progress": "In Progress",
  draft: "Draft",
};

export function BoringHome() {
  const projects = featuredProjects;
  const hasArchive = allProjects.length > projects.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-8">
      <header>
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Too Many Tabs
        </h1>
        <p className="mt-3 text-base text-muted-foreground">{summary}</p>
      </header>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">About</h2>
        {bio.map((para) => (
          <p key={para} className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {para}
          </p>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Projects</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {projects.map((project) => (
            <li key={project.slug} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-medium text-foreground">{project.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {statusLabel[project.status] ?? project.status}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{project.blurb}</p>
              {project.stack.length ? (
                <p className="mt-2 text-xs text-muted-foreground">{project.stack.join(" · ")}</p>
              ) : null}
              <Link
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="mt-2 inline-block text-xs text-foreground underline"
              >
                view project →
              </Link>
            </li>
          ))}
        </ul>
        {hasArchive ? (
          <Link to="/all-projects" className="mt-4 inline-block text-xs text-foreground underline">
            view all projects →
          </Link>
        ) : null}
      </section>
    </div>
  );
}
