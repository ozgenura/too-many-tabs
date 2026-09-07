import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageFrame } from "@/components/PageFrame";
import { ProjectScreenshot } from "@/components/ProjectScreenshot";
import { getProject, statusStyles, getScreenshots } from "@/data/projects";
import { SITE_NAME, absoluteUrl } from "@/data/site-config";
import { TabNumberLabel } from "@/components/TabNumberLabel";
import { CopyProjectLink } from "@/components/CopyProjectLink";
import { ProjectLinks } from "@/components/ProjectLinks";



export const Route = createFileRoute("/projects/$slug")({
  // An unknown slug is a real 404, not a page that says "nothing here" with a
  // 200 — that reads as a valid page to a crawler. Throwing hands it to the
  // site's own not-found page, status and all.
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.project) return {};
    const project = loaderData.project;
    const n = typeof project.tabNumber === "number" ? project.tabNumber : null;
    const suffix = n !== null ? ` (Tab #${n})` : "";
    // A project that shares the site's name would otherwise stutter:
    // "Too Many Tabs — Too Many Tabs (Tab #6)".
    const title =
      project.name === SITE_NAME
        ? `${project.name}${suffix}`
        : `${project.name} — ${SITE_NAME}${suffix}`;
    const description = project.blurb;
    const url = absoluteUrl(`/projects/${project.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.name,
            description,
            url,
            ...(project.links?.length ? { sameAs: project.links.map((l) => l.url) } : {}),
            ...(n !== null
              ? {
                  identifier: {
                    "@type": "PropertyValue",
                    name: "tabNumber",
                    value: n,
                  },
                }
              : {}),
          }),
        },
      ],
    };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  // The loader throws notFound() for an unknown slug, so by here it exists.
  const { project } = Route.useLoaderData();




  return (
    <PageFrame>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <span className="min-w-0 truncate">{project.slug}</span>
          <TabNumberLabel project={project} />
          <CopyProjectLink slug={project.slug} />
        </div>
        <h1 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-5xl">
          {project.name}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className={
              "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider " +
              statusStyles[project.status]
            }
          >
            {project.status}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {project.stack.join(" · ")}
          </span>
        </div>
        <ProjectLinks links={project.links} className="mt-6" />

        {/* Closes the loop with /localhost: a tab that is still open has a
            window you can look through. */}
        {project.preview ? (
          <Link
            to="/localhost"
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
            running at localhost:5173 →
          </Link>
        ) : null}
        <ProjectScreenshot
          slug={project.slug}
          name={project.name}
          screenshots={getScreenshots(project)}
          switcher
          className="mt-10"
          aspect="aspect-[16/9]"
        />


        <p className="mt-10 text-base leading-relaxed text-foreground sm:text-lg">
          {project.story}
        </p>

        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          {project.solved.length ? (
          <section>

            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              what it solved
            </h2>
            <ul className="mt-5 space-y-3">
              {project.solved.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <span aria-hidden className="text-accent/70">
                    ·
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
          ) : null}
          {project.learned.length ? (
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              what I learned
            </h2>
            <ul className="mt-5 space-y-3">
              {project.learned.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <span aria-hidden className="text-accent/70">
                    ·
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
          ) : null}
        </div>


        <div className="mt-20 border-t border-border/60 pt-8">
          <Link
            to="/"
            className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-accent"
          >
            × close tab
          </Link>
        </div>
      </article>
    </PageFrame>
  );
}
