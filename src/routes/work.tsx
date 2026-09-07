import { createFileRoute } from "@tanstack/react-router";

import { PageFrame } from "@/components/PageFrame";
import { CopyEmail } from "@/components/CopyEmail";
import { notFor, offers, workCta, workFraming, workIntro } from "@/data/work";
import { absoluteUrl } from "@/data/site-config";
import { openInquiry } from "@/hooks/use-inquiry";

const title = "work — Too Many Tabs";
const description =
  "Procurement excellence with the actual data: spend and process reviewed, the changes worth making ranked, and the ones that need building, built. Plus teaching the same method.";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/work") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/work") }],
  }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <PageFrame>
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-8 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">work</p>
        <h1 className="mt-6 font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          What I take on
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {workIntro}
        </p>
        <p className="mt-5 max-w-2xl border-l-2 border-border pl-5 text-sm leading-relaxed text-muted-foreground">
          {workFraming}
        </p>

        {offers.map((offer) => (
          <section key={offer.id} id={offer.id} className="mt-20 border-t border-border/60 pt-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {offer.kicker}
            </p>
            <h2 className="mt-4 font-serif text-2xl leading-snug text-foreground sm:text-3xl">
              {offer.title}
            </h2>

            <p className="mt-6 max-w-2xl border-l-2 border-accent/50 pl-5 text-base leading-relaxed text-foreground">
              {offer.problem}
            </p>

            <div className="mt-8 space-y-4">
              {offer.body.map((para) => (
                <p key={para} className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {para}
                </p>
              ))}
            </div>

            <ul className="mt-10 divide-y divide-border/50 border-y border-border/50">
              {offer.engagements.map((engagement) => (
                <li key={engagement.label} className="py-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-mono text-[13px] text-foreground">{engagement.label}</h3>
                    <span className="font-mono text-[11px] text-accent">{engagement.shape}</span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {engagement.detail}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-6 flex max-w-2xl gap-3 text-sm leading-relaxed text-muted-foreground">
              <span aria-hidden className="font-mono text-accent/70">
                →
              </span>
              <span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  you end up with{" "}
                </span>
                {offer.output}
              </span>
            </p>
          </section>
        ))}

        <section className="mt-20 border-t border-border/60 pt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            what this isn&apos;t for
          </h2>
          <ul className="mt-6 space-y-3">
            {notFor.map((item) => (
              <li key={item} className="flex max-w-2xl gap-3 text-sm leading-relaxed text-muted-foreground">
                <span aria-hidden className="font-mono text-subtle">
                  ×
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 rounded-b-lg rounded-tl-lg rounded-tr-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-foreground">{workCta.heading}</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {workCta.body}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={openInquiry}
              className="rounded-md border border-accent/60 px-4 py-2 font-mono text-xs text-accent transition-colors hover:bg-accent/10"
            >
              {workCta.action}
            </button>
            <CopyEmail />
          </div>
        </section>
      </div>
    </PageFrame>
  );
}
