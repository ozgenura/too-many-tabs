import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  featuredProjects,
  getScreenshots,
  projects as allProjects,
  statusDot,
  statusStyles,
} from "@/data/projects";
import { ProjectScreenshotStack } from "./ProjectScreenshotStack";
import { TabNumberLabel } from "./TabNumberLabel";
import { track } from "@/lib/analytics";
import { useTrackVisible } from "@/hooks/use-track-visible";


export function ProjectGrid() {
  const [shaking, setShaking] = useState<string | null>(null);
  const projects = featuredProjects;
  const hasArchiveOnly = allProjects.length > projects.length;
  const seenRef = useTrackVisible<HTMLElement>("projects_seen");


  const tryClose = (slug: string) => {
    setShaking(slug);
    window.setTimeout(() => setShaking((s) => (s === slug ? null : s)), 450);
    toast("Can't close this tab — it's already shipped.");
  };

  return (
    <section
      id="open-tabs"
      ref={seenRef}
      className="mx-auto max-w-5xl px-4 pb-24 sm:px-8 sm:pb-32"
    >
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        open tabs
      </h2>
      <div className="mt-10 grid gap-6 sm:gap-8 lg:grid-cols-2">
        {projects.map((project) => (
          <div key={project.slug} className="group/card relative">
            <Link
              to="/projects/$slug"
              params={{ slug: project.slug }}
              onClick={() => track("project_open", { slug: project.slug, from: "grid" })}
              className={
                "group flex h-full flex-col rounded-b-lg rounded-tl-lg rounded-tr-3xl border border-border bg-card/60 p-7 transition-colors hover:border-accent/60 hover:bg-card sm:p-9 " +
                (shaking === project.slug ? "motion-safe:animate-shake" : "")
              }
            >
              <ProjectScreenshotStack
                slug={project.slug}
                name={project.name}
                screenshots={getScreenshots(project)}
                className="mb-6"
              />
              <div className="flex items-center gap-2">
                <span
                  className={"h-1.5 w-1.5 shrink-0 rounded-full " + statusDot[project.status]}
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground">
                  {project.slug}
                </span>
                <TabNumberLabel project={project} asLink={false} className="shrink-0" />
              </div>
              <h3 className="mt-5 font-serif text-2xl leading-tight tracking-tight text-foreground sm:text-[28px]">

                {project.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {project.blurb}
              </p>
              {/* The outcome, not the toolchain — what a visitor deciding whether
                  to open this tab actually needs. */}
              {project.solved[0] ? (
                <p className="mt-5 flex gap-2 font-mono text-[11px] leading-5 text-accent/90">
                  <span aria-hidden className="text-accent/60">
                    →
                  </span>
                  <span>{project.solved[0]}</span>
                </p>
              ) : null}
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {project.stack.map((item) => (
                  <li
                    key={item}
                    className="rounded border border-border/70 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors group-hover:border-accent/30 group-hover:text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={
                    "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider " +
                    statusStyles[project.status]
                  }
                >
                  {project.status}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-accent">
                  open tab →
                </span>
              </div>
            </Link>
            <button
              type="button"
              aria-label={`Close ${project.slug}`}
              onClick={() => tryClose(project.slug)}
              className="absolute right-3 top-3 rounded p-1 font-mono text-[11px] text-muted-foreground opacity-0 transition-opacity hover:text-accent focus-visible:opacity-100 group-hover/card:opacity-100 sm:right-4 sm:top-4"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {hasArchiveOnly ? (
        <Link
          to="/all-projects"
          className="mt-10 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-accent"
        >
          see everything <span aria-hidden>→</span> chrome://tabs
        </Link>
      ) : null}
    </section>
  );
}
