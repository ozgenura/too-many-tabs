import hrBurnout from "@/assets/projects/hr-burnout.jpg";
import hrLearn from "@/assets/projects/hr-learn.jpg";
import hrPerf from "@/assets/projects/hr-perf.jpg";
import tmtHome from "@/assets/projects/tmt-home.jpg";
import tmtArchive from "@/assets/projects/tmt-archive.jpg";
import tmtNotes from "@/assets/projects/tmt-notes.jpg";
import cbRadar from "@/assets/projects/cb-radar.jpg";
import cbSegments from "@/assets/projects/cb-segments.jpg";
import cbEvaluation from "@/assets/projects/cb-evaluation.jpg";
import coProphecy from "@/assets/projects/co-prophecy.jpg";

/**
 * Progress, and only progress. Placement is `featured` — a project is not
 * further along because it is on the homepage. Merging the two is what made
 * StatusLine and TabCounter disagree with each other.
 */
export type Status = "shipped" | "in progress" | "draft";

export type Screenshot = {
  url: string;
  label: string;
};

export type ProjectScreenshotInput = {
  url: string;
  label?: string;
};

/**
 * Somewhere the thing can actually be seen or read. The first entry is treated
 * as primary — it gets the filled treatment on the detail page and is the one
 * that ends up in the page's structured data.
 *
 * Keep labels boring and consistent across projects ("live", "repo", "writeup")
 * so a visitor can scan for the same word on every page.
 */
export type ProjectLink = {
  label: string;
  url: string;
};

/**
 * A project that has something you can actually run right now gets embedded on
 * /localhost — the tab that is "always compiling".
 *
 * Deliberately not derived from `status`: a project can be in progress and have
 * nothing to show, which is the normal case. Being runnable is its own property.
 * Whichever project carries this is the one /localhost features, so moving it is
 * how the featured preview rotates.
 */
export type ProjectPreview = {
  /** Where the thing actually runs. Must allow being framed. */
  url: string;
  /** One sentence: what am I looking at. */
  note: string;
  /** A suggested first move — an embedded demo with no prompt is a dead end. */
  action?: string;
  /**
   * What it costs me to let you press the button, said out loud.
   *
   * A live demo that calls a paid API has to be capped, and a visitor who hits
   * that cap without warning reads it as the thing being broken. Saying the
   * limit up front turns it from a failure into a fact about the project.
   */
  limit?: string;
};

export type Project = {
  slug: string;
  /** Permanent, auto-assigned archive number. Never edited, never reused. */
  tabNumber?: number | undefined;

  /**
   * When this tab was opened — the month work on it started, "YYYY-MM".
   *
   * Deliberately separate from `tabNumber`: the number is identity and never
   * moves, this is age. Loading both onto the number was what made an old
   * project look recent, and would have forced a renumber every time an older
   * piece of work got remembered.
   */
  openedAt?: string | undefined;
  name: string;
  blurb: string;
  status: Status;
  stack: string[];
  story: string;
  solved: string[];
  learned: string[];
  featured?: boolean;
  screenshots?: ProjectScreenshotInput[];
  /** Live site, repo, writeup… Omit entirely when there is nothing to show yet. */
  links?: ProjectLink[];
  /** Set this on the one project that should be running on /localhost. */
  preview?: ProjectPreview;
};

/** Normalizes screenshots to at most 3 entries with default view-N.png labels. */
export function getScreenshots(project: Project): Screenshot[] {
  return (project.screenshots ?? [])
    .filter((shot) => Boolean(shot.url))
    .slice(0, 3)
    .map((shot, i) => ({
      url: shot.url,
      label: shot.label ?? `view-${i + 1}.png`,
    }));
}

export const projects: Project[] = [
  {
    slug: "hr-insight-hub",
    tabNumber: 1,
    openedAt: "2025-08",
    name: "HR Insight Hub",
    blurb:
      "Six dashboard pages answering the questions HR usually answers from memory: who is about to leave, who is overdue a promotion, and whether the mentorship programme is doing anything at all.",
    status: "shipped",
    stack: ["power bi", "dax", "power query"],
    screenshots: [
      { url: hrBurnout, label: "burnout.png" },
      { url: hrLearn, label: "learning.png" },
      { url: hrPerf, label: "performance.png" },
    ],
    links: [
      {
        label: "live",
        url: "https://app.powerbi.com/view?r=eyJrIjoiYTU4Y2M0NDctNzQwOC00YTEzLWIxMDItN2NiNWUzMTQzNWZlIiwidCI6IjhmOTA5Nzc5LTE1ZGQtNGQ5YS04ZDNkLWE2ZDczMmJhYWI0MCIsImMiOjl9",
      },
      {
        label: "writeup",
        url: "https://medium.com/@ozgenuracun/from-gut-feeling-to-data-truth-building-an-hr-insight-hub-with-power-bi-5df34c122701",
      },
    ],
    story:
      "Three questions kept coming back: why do the good people leave, who is close to burning out, and does any of the money spent on mentorship and training actually do anything. HR answers those from experience most of the time, which works right up until it doesn't.\n\nThis was my capstone for the Miuul Data Analytics Bootcamp, built as a briefing to the leadership of a fictional company rather than a tour of a dashboard. Six pages — attrition and loyalty, burnout risk, promotion readiness, learning and mentorship, team dynamics — built on the HR Attrition dataset, each resting on composite DAX measures rather than raw fields, because no single column tells you who is at risk.\n\nThe useful part was everywhere the data disagreed with the brief. The most loyal people were paid below their peers. Forty-four of the fifty-five employees flagged as promotion-ready had not been promoted. And the mentorship programme, which existed to improve retention, had higher attrition inside it than outside.",
    solved: [
      "Burnout, loyalty and promotion-readiness became scores you can sort a list by, instead of opinions",
      "Surfaced 44 people who were eligible for promotion and had not been promoted",
      "Showed the mentorship programme was doing the opposite of what it was funded to do",
    ],
    learned: [
      "Writing the DAX was the short part; defending the weights inside each composite score was the work",
      "The burnout score carries a random term by design, which makes it a demonstration rather than a prediction",
      "The findings worth presenting were the ones that contradicted the assumption, not the ones that confirmed it",
    ],
  },
  {
    slug: "creditboard",
    tabNumber: 2,
    openedAt: "2026-06",
    name: "CreditBoard",
    blurb:
      "A credit committee you can run before the real committee meets. It argues with itself in three voices, commits to a decision, and every number it cites comes from the dataset rather than the model.",
    status: "in progress",
    stack: ["copilot studio", "gpt-4.1", "python", "pandas", "excel"],
    screenshots: [
      { url: cbRadar, label: "radar.png" },
      { url: cbSegments, label: "grounded-answer.png" },
      { url: cbEvaluation, label: "evaluation.png" },
    ],
    story:
      "A credit committee is three people with different incentives looking at the same application. The risk analyst wants to refuse, the sales manager wants to approve, and someone has to land between them. Most of that argument is predictable, and almost none of it gets written down.\n\nCreditBoard is that meeting, held before the meeting. Built for the Miuul Microsoft 365 Copilot Studio programme on the public Home Credit dataset — 307,511 applications across five tables. Python does the analysis, the findings go into one knowledge document, and the agent is allowed to read nothing else. Two modes: a committee that speaks in three voices and then commits to approve, approve-with-conditions, or refuse; and a radar that scores a portfolio against three behavioural warning signals on a traffic light.\n\nThe finding that shaped the design was the one that contradicted the rule everybody applies. Applicants borrowing more than eight times their annual income default at 7.1% — below the 8.07% average — because loans that size only go to strong profiles in the first place. A ratio treated everywhere as an automatic refusal turns out, on its own, to be evidence of nothing. That number is now what the sales-manager persona uses to argue back.\n\nIt was finished and handed in. It stays open because the committee-and-radar pattern is the reusable part, and pointing it at a second domain is the only real test of whether it generalises.",
    solved: [
      "Three committee perspectives and a committed decision, in the time it takes to read a paragraph",
      "A radar that separates a 2,535-customer red band defaulting at 18.3% from a green band at 6.4%",
      "Every number the agent says traces back to the dataset — and when something isn't in there, it says so instead of estimating",
    ],
    learned: [
      'Grounding is a product decision, not a setting: the agent reads as trustworthy because it is allowed to say "that isn\'t in the data"',
      "A 12-case evaluation caught persona leakage and a wrong escalation before release; writing the expected answers first is what found them",
      "The thresholds had to be derived, not chosen — a traffic light with invented cutoffs is decoration",
      "Power BI was the plan and Excel was the deadline; the analysis had to survive the downgrade, which meant the numbers had to be right before the tool was chosen",
    ],
  },
  {
    slug: "too-many-tabs",
    tabNumber: 4,
    openedAt: "2026-08",
    name: "Too Many Tabs",
    blurb:
      "The shelf you are looking at. Generated in an afternoon, then taken apart and rebuilt so it would keep working after I stopped paying for the thing that generated it.",
    status: "shipped",
    stack: ["tanstack start", "cloudflare workers", "supabase", "typescript"],
    screenshots: [
      { url: tmtHome, label: "home.png" },
      { url: tmtArchive, label: "archive.png" },
      { url: tmtNotes, label: "notes.png" },
    ],
    links: [
      { label: "live", url: "https://toomanytabs.dev" },
      { label: "repo", url: "https://github.com/ozgenura/too-many-tabs" },
    ],
    story:
      "It started as a prompt. An AI builder turned it into a working site in an afternoon, and then kept going: an admin panel, authentication, a database, thirteen migrations, an audit log.\n\nWhen I looked at what all of it was for, the answer was that one person — me — could edit six paragraphs from a browser. The screenshot uploader had never held a single image. The audit log was recording my own typing.\n\nSo I took it apart. The content moved into files where it can be reviewed in a diff, the backend shrank to the two things visitors actually write, and roughly half the code stopped existing. The site got smaller, faster, and mine.",
    solved: [
      "Runs on its own domain and infrastructure, with nothing left to leave",
      "Content lives in the repo, so publishing is a commit and not a login",
      "Half the code went away and the site got faster",
    ],
    learned: [
      "The generated version was the fastest to build and the slowest to own",
      "A feature nobody uses still costs you every time you read the file",
      '"Can this be a file?" removed more code than any refactor',
    ],
  },
  {
    slug: "corporate-oracle",
    tabNumber: 3,
    openedAt: "2026-07",
    name: "Corporate Oracle",
    // TODO: your words. Everything below this line is a placeholder.
    blurb:
      "A satirical oracle for corporate life. Ask it anything; it answers like a steering committee.",
    status: "in progress",
    // Read off the codebase, not written by hand — change freely.
    stack: ["tanstack start", "cloudflare workers", "vercel ai sdk", "typescript"],
    links: [{ label: "live", url: "https://oracle.toomanytabs.dev" }],
    screenshots: [{ url: coProphecy, label: "prophecy.png" }],
    story:
      "Still a local experiment that happens to have a URL — it is deployed so it can be tried, not because it is finished. It exists because the answers people actually get at work are already absurd; this only removes the meeting.",
    solved: [],
    learned: [],
    featured: false,
    // Whichever project carries `preview` is the one /localhost mounts.
    preview: {
      url: "https://oracle.toomanytabs.dev",
      note: "An oracle for corporate life. It has never once said no.",
      action: "ask it whether this meeting could have been an email",
      // The real number, not "rate limited". A visitor who knows they have
      // three left spends them; one told the thing is "limited" assumes it is
      // broken the first time it says no.
      limit: "three prophecies per visitor, per day. the budget is mine.",
    },
  },
  {
    slug: "untitled-travel-app",
    tabNumber: 5,
    openedAt: "2026-09",
    name: "Untitled Travel App",
    // Deliberately unnamed: the working title is a draft too. How it works is
    // kept off the page on purpose — see the story.
    blurb:
      "A travel app at the draft stage — enough of a plan to argue with, nothing to show. How it works stays off this page for now.",
    status: "draft",
    stack: [],
    featured: false,
    story:
      "Trips leave behind far more than anyone ever looks at again. The material is all there; what's missing is whatever turns it back into something you'd sit through a second time. That's the part I care about, and it's the part nothing I've used gets right.\n\nWhat exists is a set of product documents written in an afternoon and a name that won't survive. No prototype, no code, no screenshot. The approach isn't written down here on purpose — it's the only part that's mine so far.\n\nThe one thing that has actually happened is a deletion. The first version of the plan carried the hardest feature in the whole design, the one that makes products in this space take years. Cutting it before a line of code existed removed the engineering problem, the battery cost, most of the permissions and the biggest privacy objection at once — and made the idea testable this week instead of next year. Deciding what not to build was the entire first day's work.",
    solved: [
      "Cut the hardest feature before any code existed, and got a simpler product for it",
      "Made the idea testable now instead of after the next trip",
      "Nothing else. There is no product here yet.",
    ],
    learned: [
      "Eleven documents is not eleven decisions — one of them changed what gets built",
      "The escape hatch turned out to be the main road",
      "The same rule keeps surfacing in my work: don't let a system present a guess as a measurement",
    ],
  },
];

export const statusStyles: Record<Status, string> = {
  // shipped inherits the strongest treatment: it is the top of the ladder now.
  shipped: "border-accent/60 bg-accent/10 text-accent",
  "in progress": "border-accent/30 text-accent/80",
  draft: "border-border text-muted-foreground",
};

export const statusDot: Record<Status, string> = {
  shipped: "bg-accent",
  "in progress": "bg-accent/80 motion-safe:animate-pulse-soft",
  draft: "border border-accent/40 bg-transparent",
};

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** How many projects the homepage grid shows; the rest live in the archive. */
export const FEATURED_LIMIT = 4;

/** Homepage set: featured only, capped at FEATURED_LIMIT, in declaration order. */
export const featuredProjects: Project[] = projects
  .filter((p) => p.featured !== false)
  .slice(0, FEATURED_LIMIT);

/** True when a project has a valid, assigned archive number. */
export function hasTabNumber(project: Pick<Project, "tabNumber">): boolean {
  return typeof project.tabNumber === "number" && Number.isFinite(project.tabNumber);
}

/** Formats a project's permanent archive number, e.g. "Tab #7", or "Tab #—" when missing. */
export function tabLabel(project: Pick<Project, "tabNumber">): string {
  return hasTabNumber(project) ? `Tab #${project.tabNumber}` : "Tab #—";
}

/**
 * Newest (highest) tab number first; entries missing a number sort to the bottom
 * so a data issue is visible instead of silently reordering the archive.
 */
export function byTabNumberDesc(
  a: Pick<Project, "tabNumber">,
  b: Pick<Project, "tabNumber">,
): number {
  const av = hasTabNumber(a) ? (a.tabNumber as number) : Number.NEGATIVE_INFINITY;
  const bv = hasTabNumber(b) ? (b.tabNumber as number) : Number.NEGATIVE_INFINITY;
  return bv - av;
}

/**
 * The project currently mounted on /localhost, if any. Whichever entry carries
 * `preview` wins — moving that field from one project to another is how the
 * featured preview rotates.
 */
export const previewProject: Project | undefined = projects.find((p) => p.preview);

/**
 * The year a tab was opened, e.g. "2025" — empty when unset or malformed.
 *
 * Kept as a separate readout from `tabLabel` so the two facts stay separable:
 * "Tab #1" says which tab, "2025" says how old.
 */
export function openedYear(project: Pick<Project, "openedAt">): string {
  const match = /^(\d{4})-(?:0[1-9]|1[0-2])$/.exec(project.openedAt ?? "");
  return match?.[1] ?? "";
}
