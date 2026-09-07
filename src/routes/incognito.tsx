import { useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { PageFrame } from "@/components/PageFrame";
import { wearIncognitoFavicon } from "@/lib/incognito-favicon";

const title = "incognito — Too Many Tabs";
const description = "The pages that never show up in the tab strip.";

export const Route = createFileRoute("/incognito")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      // Never indexed, launch or not. A page called incognito that turns up in
      // search results is a page that did not mean it.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: IncognitoPage,
});

/**
 * The doorway to the pages that are deliberately not tabs.
 *
 * It exists because the hidden pages had exactly one entrance — ⌘K and "/" —
 * and neither of those exists on a phone, while the footer went on advertising
 * them anyway. A visitor on a phone could not reach half the site.
 */
const hidden = [
  { to: "/all-projects", name: "chrome://tabs", note: "every tab in the archive" },
  { to: "/draft", name: "untitled draft", note: "ideas that haven't earned a tab" },
  { to: "/press-kit", name: "press-kit", note: "for when someone asks" },
  // err_too_many_tabs is deliberately absent. It already has two ways in — the
  // struck-through "a tab I swear I closed" in closed tabs, and the footer's
  // "not sure where this goes" — and an easter egg listed by name on an index
  // page has stopped being one.
] as const;

function IncognitoPage() {
  // The browser changes its own chrome when you go incognito; so does this.
  useEffect(() => wearIncognitoFavicon(), []);

  return (
    <PageFrame>
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-8 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">incognito</p>
        <h1 className="mt-6 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          You&apos;ve gone incognito
        </h1>
        <p className="mt-6 max-w-xl font-mono text-sm leading-6 text-muted-foreground">
          These pages never show up in the tab strip. They still exist — they are just not open.
          Nothing about this page is recorded anywhere, which is also true of the rest of the site,
          but it sounds better here.
        </p>

        <ul className="mt-12 space-y-6">
          {hidden.map((page) => (
            <li key={page.to} className="font-mono text-sm leading-6">
              <Link to={page.to} className="text-accent underline-offset-4 hover:underline">
                {page.name}
              </Link>
              <span className="text-muted-foreground"> — {page.note}</span>
            </li>
          ))}
        </ul>

        <p className="mt-16 font-mono text-[11px] text-muted-foreground">
          check the tab icon. it changed.
        </p>
      </div>
    </PageFrame>
  );
}
