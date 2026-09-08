import { createFileRoute, Link } from "@tanstack/react-router";

import { PageFrame } from "@/components/PageFrame";
import { PreviewFrame } from "@/components/PreviewFrame";
import { TabNumberLabel } from "@/components/TabNumberLabel";
import { previewProject, projects } from "@/data/projects";

const title = "localhost:5173 — Too Many Tabs";
const description = "The dev preview tab: whatever is being built runs here before it is real.";

export const Route = createFileRoute("/localhost")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      // Whatever is mounted here is unfinished by definition; it should not be
      // the thing a search engine files under this site's name.
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LocalhostPage,
});

function LocalhostPage() {
  const project = previewProject;
  const stillOpen = projects.filter((p) => p.status === "in progress" || p.status === "draft");

  return (
    <PageFrame>
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-8 sm:py-28">
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span
            aria-hidden
            className={
              "h-2 w-2 rounded-full " +
              (project ? "bg-accent motion-safe:animate-pulse" : "bg-muted-foreground/40")
            }
          />
          {project ? "running" : "idle"}
        </p>

        {project ? <Mounted project={project} /> : <Idle />}

        {/* Shared on purpose. This paragraph is the only thing that explains
            why the tab exists, and it used to live inside the idle branch —
            so the moment something was actually mounted, the explanation
            disappeared and a first-time visitor landed on a running preview
            with no idea what they were looking at. */}
        <WhatThisTabIs mounted={Boolean(project)} stillOpen={stillOpen.length} />
      </div>
    </PageFrame>
  );
}

function Mounted({ project }: { project: NonNullable<typeof previewProject> }) {
  const preview = project.preview!;

  return (
    <>
      <h1 className="mt-8 max-w-xl font-serif text-3xl leading-tight text-foreground sm:text-4xl">
        {project.name}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
        <TabNumberLabel project={project} />
        <span aria-hidden>·</span>
        <span>{project.status}</span>
      </div>

      <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground">{preview.note}</p>

      <PreviewFrame preview={preview} name={project.name} />

      {preview.action ? (
        <p className="mt-5 flex max-w-xl gap-3 font-mono text-[12px] leading-6 text-muted-foreground">
          <span aria-hidden className="text-accent/70">
            &gt;
          </span>
          <span>try: {preview.action}</span>
        </p>
      ) : null}

      <p className="mt-10 font-mono text-[11px] text-muted-foreground">
        it is not finished and that is the point.{" "}
        <Link
          to="/projects/$slug"
          params={{ slug: project.slug }}
          className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          read the story →
        </Link>
      </p>
    </>
  );
}

function Idle() {
  return (
    <h1 className="mt-8 max-w-xl font-serif text-3xl leading-tight text-foreground sm:text-4xl">
      Nothing is mounted right now.
    </h1>
  );
}

function WhatThisTabIs({ mounted, stillOpen }: { mounted: boolean; stillOpen: number }) {
  const tabs = `${stillOpen} tab${stillOpen === 1 ? "" : "s"} still open`;

  return (
    <div className="mt-12 border-t border-border/60 pt-8">
      <p className="max-w-lg font-mono text-xs leading-6 text-muted-foreground">
        [ dev server ] {mounted ? "1 preview mounted" : "no output"} · {tabs}
        {mounted ? null : " · next build pending"}
      </p>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        This tab is where whatever I am building runs before it is real — the half-broken version,
        live, while it is still half-broken. When something is far enough along to be embarrassing
        in public, it shows up here first.
      </p>
      <p className="mt-8 font-mono text-[11px] text-muted-foreground">
        <Link
          to="/all-projects"
          className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          see what is still open →
        </Link>
      </p>
    </div>
  );
}
