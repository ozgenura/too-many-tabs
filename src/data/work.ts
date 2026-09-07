/**
 * Everything on /work.
 *
 * This is the one page on the site where the tab metaphor stops and the writing
 * gets plain: it is where someone decides whether to pay for something. The
 * voice lives in the frame around it, not inside it.
 *
 * All of it is a first draft — replace with your own words.
 */

export type Engagement = {
  label: string;
  /** How big the thing is, in time. Answers "can I afford this?" without a price. */
  shape: string;
  detail: string;
};

export type Offer = {
  id: string;
  kicker: string;
  title: string;
  /** One sentence: the problem, and whose problem it is. */
  problem: string;
  body: string[];
  engagements: Engagement[];
  /**
   * What they are left holding when it is over.
   *
   * Rendered straight after the "you end up with" label, which completes the
   * sentence — so this starts lowercase and carries no leading article of its
   * own beyond the one the sentence needs.
   */
  output: string;
};

export const workIntro =
  "Two things I take on, alongside the projects on this site. Both start from the same place: a process nobody can fully explain, and numbers nobody fully trusts.";

/**
 * Said once, plainly, and never apologised for again. Being early has an honest
 * commercial expression — how the first engagement is scoped — and saying so is
 * stronger than either implying a client list or hedging the whole page.
 */
export const workFraming =
  "This is the work I do inside a procurement organisation, and I am taking it outside of one for the first time. That is reflected in how I scope a first engagement, not in how carefully I do it.";

export const offers: Offer[] = [
  {
    id: "consulting",
    kicker: "consulting",
    title: "Procurement excellence, done with the actual data",
    problem:
      "You know roughly where the money goes. What is harder to show is why the process lets it go there — which steps are load-bearing, which are habit, and which number to trust when two systems disagree.",
    body: [
      "This is what I do day to day: read the spend data, map what actually happens against what the process document says, and find the gap between them. Most of the value shows up right here — half the steps turn out to be habit, and half the columns turn out to be opinions rather than data.",
      "Out of that comes a short list of changes worth making, in the order worth making them. Some are process: a step removed, an approval that stops meaning two different things. Some need something built — and then I build the smallest version that removes work rather than adding a screen.",
    ],
    engagements: [
      {
        label: "Spend and process review",
        shape: "about two weeks",
        detail:
          "I work through the real data and the real process and write down what is load-bearing, what is duplicated, what is quietly wrong, and what I would change first. You keep the write-up whether or not we do anything else.",
      },
      {
        label: "Improvement, built",
        shape: "four to eight weeks",
        detail:
          "One clearly scoped change — reconciliation that holds, a report that runs itself, a request flow that stops living in inboxes — designed, built, handed over and documented.",
      },
      {
        label: "Ongoing",
        shape: "a day or two a month",
        detail:
          "For when the work is real but not full-time: keeping the numbers honest and picking off the next bottleneck.",
      },
    ],
    output:
      "a written diagnosis you could hand to someone else, with the changes ranked — and, if we build, a working thing your team owns and the reasoning behind it written down.",
  },
  {
    id: "teaching",
    kicker: "teaching",
    title: "Teams that stop guessing",
    problem:
      "Your team has the data and the tools. What is missing is a method: how to tell signal from habit, and how to decide which number is right when two systems disagree.",
    body: [
      "The same work, taught instead of done. How to look at a messy spend table and find the three columns that matter, how to read a process for what is load-bearing, how to write a number down so it means the same thing next quarter.",
      "Sessions run on your own data wherever possible. Worked examples on somebody else's clean dataset are the reason most training does not survive contact with Monday.",
    ],
    engagements: [
      {
        label: "Workshop",
        shape: "half a day",
        detail:
          "One topic, hands on, small group. Good for a team that wants to see whether this is worth more time.",
      },
      {
        label: "In-house programme",
        shape: "a few sessions over some weeks",
        detail:
          "Spaced out on purpose, so people bring back what broke in between. That is where the learning is.",
      },
      {
        label: "One to one",
        shape: "recurring, short",
        detail:
          "For someone who is the only data person in the room and needs somebody to argue with.",
      },
    ],
    output:
      "materials and recordings that stay with you, and people who can do the next one without me.",
  },
];

/**
 * Saying who this is not for is the whole point: it costs nothing to publish
 * and it makes the yes mean something. Same instinct as the closed tabs.
 */
export const notFor = [
  "Work that needs to start this week. I have a full-time job; this runs alongside it, one thing at a time.",
  "A decision that is already made and just needs hands. I will ask why, and that is not always welcome.",
  "Anything where the answer has to be a dashboard before anyone has looked at the data.",
];

export const workCta = {
  heading: "If any of that sounds like your week",
  body: "Tell me what is going wrong, in whatever detail you have. A messy paragraph is fine — it is usually more useful than a tidy brief.",
  action: "Open a tab →",
};
