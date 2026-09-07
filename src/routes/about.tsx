import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/PageFrame";
import { CopyEmail } from "@/components/CopyEmail";
import { aboutIntro, aboutTimeline, aboutFacts, authorLine, authorName, stack } from "@/data/site";
import portrait from "@/assets/projects/ozgenur.jpg";

const title = "about:me — Too Many Tabs";
const description =
  "Who's behind the open tabs: procurement excellence, data and AI experiments, and a habit of building instead of bookmarking.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageFrame>
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-8 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          about:me
        </p>
        <h1 className="mt-6 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          a person with too many tabs
          {/* The cursor stays monospace — it is a terminal artefact, not prose. */}
          <span
            aria-hidden
            className="ml-1 inline-block font-mono text-2xl animate-blink text-accent"
          >
            _
          </span>
        </h1>

        <div className="mt-10 space-y-5">
          {aboutIntro.map((line) => (
            <div key={line}>
              <p className="max-w-2xl text-base leading-relaxed text-foreground">{line}</p>
              {line.includes("never opens") ? (
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                  // aspirational. still debugging this one.
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {/* After the writing, not before it. The page opens with a sentence
            about the person; the face is the thing you leave with, along with
            the name the rest of the site never says. */}
        <section className="mt-16 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <img
            src={portrait}
            alt={authorName}
            width={562}
            height={699}
            loading="lazy"
            className="w-32 shrink-0 rounded-lg border border-border object-cover sm:w-40"
          />
          <div>
            <p className="font-serif text-2xl leading-tight text-foreground">{authorName}</p>
            <p className="mt-2 font-mono text-sm leading-6 text-muted-foreground">{authorLine}</p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            history
          </h2>
          <ol className="mt-6 space-y-4 border-l border-border/60 pl-5">
            {aboutTimeline.map((item) => (
              <li key={item.when} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[23px] top-2 h-1.5 w-1.5 rounded-full bg-accent/70"
                />
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  {item.when}
                </p>
                <p className="mt-1 font-mono text-sm leading-6 text-foreground">{item.what}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            stack
          </h2>
          <dl className="mt-6 space-y-3">
            {stack.map((row) => (
              <div key={row.label} className="flex flex-wrap gap-x-3 font-mono text-sm">
                <dt className="w-28 shrink-0 text-muted-foreground">{row.label}</dt>
                <dd className="text-foreground">{row.items}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            details
          </h2>
          <dl className="mt-6 space-y-3">
            {aboutFacts.map((fact) => (
              <div key={fact.label} className="flex flex-wrap gap-x-3 font-mono text-sm">
                <dt className="w-28 shrink-0 text-muted-foreground">{fact.label}</dt>
                <dd className="text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-16 border-t border-border/50 pt-6">
          <p className="font-mono text-[11px] text-muted-foreground">
            best way to reach me — click to copy
          </p>
          <div className="mt-3">
            <CopyEmail />
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
