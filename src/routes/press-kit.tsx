import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/PageFrame";
import { ProjectScreenshotStack } from "@/components/ProjectScreenshotStack";
import { ProjectScreenshot } from "@/components/ProjectScreenshot";
import {
  projects,
  getScreenshots,
  statusStyles,
  statusDot,
  type Status,
} from "@/data/projects";

const title = "press-kit — Too Many Tabs";
const description =
  "Living brand reference for Too Many Tabs: real colors, real type, real components, pulled straight from the site's own tokens.";

export const Route = createFileRoute("/press-kit")({
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
  component: PressKitPage,
});

const tokens = [
  { name: "background", varName: "--background" },
  { name: "surface", varName: "--card" },
  { name: "border", varName: "--border" },
  { name: "text primary", varName: "--foreground" },
  { name: "text secondary", varName: "--muted-foreground" },
  { name: "text tertiary", varName: "--subtle" },
  { name: "amber", varName: "--accent" },
  { name: "amber deep", varName: "--primary" },
  { name: "amber muted", varName: "--muted" },
] as const;

const statuses: Status[] = ["shipped", "in progress", "draft"];

const miniTabs = [
  { label: "too-many-tabs", active: true },
  { label: "notes.md", active: false },
  { label: "about:me", active: false },
];

/** Resolves a CSS custom property to a hex string by rasterizing it once. */
function toHex(value: string): string {
  if (!value) return "—";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return value;
    ctx.fillStyle = "#000000";
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return (
      "#" +
      [r, g, b]
        .map((c) => (c ?? 0).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  } catch {
    return value;
  }
}

function useLiveTokens() {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const token of tokens) {
        next[token.varName] = toHex(style.getPropertyValue(token.varName).trim());
      }
      setValues(next);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return values;
}

function PressKitPage() {
  const hexes = useLiveTokens();
  const project = projects[0]!;
  const shots = getScreenshots(project);

  return (
    <PageFrame exemptBoring>
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-8 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          press-kit · brand reference
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
          Too Many Tabs — Brand Kit
        </h1>
        <p className="mt-4 max-w-xl font-mono text-sm leading-6 text-muted-foreground">
          Everything below is read live from the site's own tokens, in whatever theme you're
          currently in. Nothing here is a copy.
        </p>

        {/* Colors */}
        <section className="mt-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">colors</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
            {tokens.map((token) => (
              <div key={token.varName}>
                <div
                  className="h-16 w-full rounded-md border border-border"
                  style={{ background: `var(${token.varName})` }}
                />
                <p className="mt-2 font-mono text-[11px] text-foreground">{token.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {hexes[token.varName] ?? "…"}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mt-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">typography</h2>
          <div className="mt-6 space-y-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                display serif — headings
              </p>
              <p className="mt-2 font-serif text-4xl leading-tight text-foreground">
                Too many tabs, one of them ships
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                italic serif — manifesto
              </p>
              <p className="mt-2 font-serif text-xl italic leading-relaxed text-foreground/90">
                “I keep them open because closing one feels like deciding.”
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                monospace — labels, meta, code asides
              </p>
              <p className="mt-2 font-mono text-sm text-foreground">
                status: in progress · last tab opened: today
              </p>
            </div>
          </div>
        </section>

        {/* Voice */}
        <section className="mt-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">voice</h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-foreground">
            I write the way I'd explain something across a table: plain, a little self-aware, no
            corporate filler. Irony is allowed, cynicism isn't. Status is honesty — shipped means
            shipped, in progress means unfinished, draft means I'm still arguing with myself, and
            exploring means I don't know yet. Jokes go in code-comment asides, not in the headline.
          </p>
          <p className="mt-3 font-mono text-[12px] text-muted-foreground">
            // if a sentence needs a buzzword to survive, it doesn't.
          </p>
        </section>

        {/* Components */}
        <section className="mt-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">components</h2>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            site tab bar
          </p>
          <div className="mt-2 rounded-md border border-border/70 bg-card/40">
            <div className="flex items-end gap-1 px-3 pt-2">
              {miniTabs.map((tab) => (
                <span
                  key={tab.label}
                  className={
                    "flex items-center gap-2 rounded-t-md border border-b-0 px-3 py-1.5 font-mono text-[11px] " +
                    (tab.active
                      ? "border-border bg-background text-accent"
                      : "border-transparent text-muted-foreground")
                  }
                >
                  <span
                    className={
                      "h-1.5 w-1.5 rounded-full " +
                      (tab.active ? "bg-accent" : "bg-muted-foreground/30")
                    }
                  />
                  {tab.label}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            status badges
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {statuses.map((status) => (
              <span
                key={status}
                className={
                  "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] " +
                  statusStyles[status]
                }
              >
                <span className={"h-1.5 w-1.5 shrink-0 rounded-full " + statusDot[status]} />
                {status}
              </span>
            ))}
          </div>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            project card — fanned screenshot stack
          </p>
          <div className="group mt-2 rounded-lg border border-border bg-card p-4">
            <ProjectScreenshotStack
              slug={project.slug}
              name={project.name}
              screenshots={shots}
            />
            <div className="mt-4">
              <h3 className="font-serif text-xl text-foreground">{project.name}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{project.blurb}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            in-frame tab switcher — detail pages
          </p>
          <div className="mt-2">
            <ProjectScreenshot
              slug={project.slug}
              name={project.name}
              screenshots={shots}
              switcher
            />
          </div>
        </section>

        <p className="mt-20 font-mono text-[11px] text-muted-foreground">
          this page exists so nobody has to guess the hex codes twice.
        </p>
      </div>
    </PageFrame>
  );
}
