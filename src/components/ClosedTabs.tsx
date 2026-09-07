import { Link } from "@tanstack/react-router";
import { closedTabs } from "@/data/site";

const HIDDEN_LINK = "a tab I swear I closed";

/**
 * Ideas that were dropped, kept on the page on purpose.
 *
 * This is the most differentiated thing on the site — nobody publishes what
 * they killed — and it reads as judgement rather than output, which is exactly
 * what it is meant to. It lived on /draft, two clicks from anywhere; it belongs
 * where people actually land.
 */
export function ClosedTabs() {
  if (closedTabs.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-8 sm:pb-32">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        closed tabs
      </h2>
      <p className="mt-4 max-w-xl font-mono text-[12px] leading-6 text-muted-foreground">
        things I let go of. keeping them here so I don&apos;t reopen them by accident.
      </p>
      <ul className="mt-8 space-y-3">
        {closedTabs.map((item) => (
          <li key={item} className="flex gap-3 font-mono text-[13px] leading-6 text-subtle">
            <span aria-hidden>×</span>
            {item === HIDDEN_LINK ? (
              <Link to="/err-too-many-tabs" className="line-through text-subtle">
                {item}
              </Link>
            ) : (
              <span className="line-through">{item}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
