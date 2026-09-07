import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { PageFrame } from "@/components/PageFrame";
import { draftIdeas, graduatedDrafts } from "@/data/drafts";
import { getProject, tabLabel } from "@/data/projects";
import { openInquiryWith } from "@/hooks/use-inquiry";

const title = "untitled draft — Too Many Tabs";
const description =
  "Ideas that haven't earned a tab yet: raw one-liners waiting to become something worth building.";

export const Route = createFileRoute("/draft")({
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
  component: DraftPage,
});

const SCRAMBLE_CHARS = "!<>-_\/[]{}—=+*^?#________";

/** Scramble-to-reveal decode over ~450ms; always settles on the final text. */
function useScramble(text: string | null) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (text === null) {
      setDisplay("");
      return;
    }
    const STEPS = 22;
    const STEP_MS = 20;
    let step = 0;
    let timer = 0;

    const tick = () => {
      step += 1;
      const reveal = Math.floor((step / STEPS) * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        out +=
          i < reveal ? text[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      setDisplay(out);
      if (step < STEPS) {
        timer = window.setTimeout(tick, STEP_MS);
      } else {
        setDisplay(text);
      }
    };

    timer = window.setTimeout(tick, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [text]);

  return display;
}

function DraftPage() {
  // Moved here from /localhost: rolling a random idea belongs next to the list
  // it rolls from, not on a page whose subject is something else entirely.
  const [rolled, setRolled] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Reduced motion gets the line plainly. The scramble moves nothing, but it is
  // rapid character churn — its own kind of visual noise, so it is skipped too.
  const display = useScramble(reduced ? null : rolled);

  // A graduated entry naming a slug that no longer exists is dropped rather than
  // rendered as a dead link: this section's whole job is to be verifiable.
  const graduated = useMemo(
    () =>
      graduatedDrafts.flatMap(({ line, slug }) => {
        const project = getProject(slug);
        return project ? [{ line, project }] : [];
      }),
    [],
  );

  const roll = () => {
    if (draftIdeas.length === 0) return;
    const pool = draftIdeas.filter((idea) => idea !== rolled);
    const from = pool.length ? pool : draftIdeas;
    setRolled(from[Math.floor(Math.random() * from.length)] ?? null);
  };

  return (
    <PageFrame>
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-8 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          untitled draft
        </p>
        <h1 className="mt-6 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          Ideas that haven&apos;t earned a tab yet
        </h1>

        <ul className="mt-12 space-y-5">
          {draftIdeas.map((idea) => (
            <li key={idea} className="flex gap-3 font-mono text-sm leading-6 text-foreground">
              <span className="text-muted-foreground">-</span>
              <span>{idea}</span>
            </li>
          ))}
        </ul>

        {graduated.length > 0 ? (
          <div className="mt-16 border-t border-border/60 pt-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              some of these graduated
            </p>
            <ul className="mt-6 space-y-4">
              {graduated.map(({ line, project }) => (
                <li key={project.slug} className="font-mono text-sm leading-6">
                  <p className="text-muted-foreground line-through decoration-muted-foreground/50">
                    {line}
                  </p>
                  {/* Own line, indented: keeps the project name from wrapping
                      away from the arrow that points at it. */}
                  <p className="mt-1 pl-4">
                    <span aria-hidden className="text-muted-foreground">
                      →{" "}
                    </span>
                    {project.status === "shipped" ? (
                      <>
                        <Link
                          to="/projects/$slug"
                          params={{ slug: project.slug }}
                          className="text-accent underline-offset-4 hover:underline"
                        >
                          {project.name}
                        </Link>{" "}
                        <span className="text-muted-foreground">{tabLabel(project)}</span>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/localhost"
                          className="text-accent underline-offset-4 hover:underline"
                        >
                          {project.name}
                        </Link>{" "}
                        <span className="text-muted-foreground">still compiling</span>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {draftIdeas.length > 1 ? (
          <div className="mt-14 border-t border-border/60 pt-8">
            <button
              type="button"
              onClick={roll}
              className="inline-flex items-center gap-2 rounded-md border border-accent px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent/10"
            >
              <span aria-hidden>$</span> roll a tab →
            </button>

            {rolled !== null ? (
              <div className="mt-6 max-w-xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  tonight&apos;s tab:
                </p>
                <p className="mt-3 min-h-6 font-mono text-sm leading-6 text-foreground">
                  {reduced ? rolled : display}
                </p>
                <p className="mt-4 font-mono text-[11px] text-muted-foreground">
                  no promises —{" "}
                  <button
                    type="button"
                    onClick={() => openInquiryWith(`about this one:\n"${rolled}"\n\n`)}
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    unless you ask →
                  </button>
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="mt-16 font-mono text-[11px] text-muted-foreground">unsaved. probably fine.</p>
      </div>
    </PageFrame>
  );
}
