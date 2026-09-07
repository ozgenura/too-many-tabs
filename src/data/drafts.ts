export const draftIdeas = [
  "a whatsapp reminder tool for small businesses, still just a note",
  "a supplier scorecard that fits on one screen and nobody has to explain",
  "something that reads my invoices and quietly flags the weird ones",
  "a tiny app that tells me which of my tabs I haven't touched in a month",
  "a price-history tracker for the five things I keep re-buying",
  "a newsletter I'd actually finish writing, maybe six issues long",
];

/**
 * Lines that used to sit in the list above and don't any more.
 *
 * This is the only place on the site that shows the pipeline actually running:
 * a note becomes a tab. Without it /draft is a closed room — six one-liners and
 * no evidence that any of them ever go anywhere.
 *
 * `line` is the wording as it stood while it was still a draft, not the finished
 * project's blurb. The gap between the two is the point.
 */
export type GraduatedDraft = {
  line: string;
  /** Must match a `slug` in projects.ts. */
  slug: string;
};

export const graduatedDrafts: GraduatedDraft[] = [
  {
    line: "a dashboard that explains itself, so nobody has to sit through a walkthrough",
    slug: "hr-insight-hub",
  },
  {
    line: "a portfolio that isn't a résumé",
    slug: "too-many-tabs",
  },
  {
    line: "something that translates corporate speak back into plain english",
    slug: "corporate-oracle",
  },
];
