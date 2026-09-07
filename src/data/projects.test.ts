import { describe, expect, it } from "vitest";

import { hasTabNumber, openedYear, projects } from "./projects";

describe("tab numbers", () => {
  it("are unique", () => {
    // They were re-baselined once, before launch, and are frozen after that.
    // A duplicate means two things claim one archive number.
    const numbers = projects.filter(hasTabNumber).map((p) => p.tabNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});

describe("openedYear", () => {
  it("reads the year out of a well-formed openedAt", () => {
    expect(openedYear({ openedAt: "2025-08" })).toBe("2025");
  });

  it("returns nothing rather than guessing at bad input", () => {
    for (const openedAt of [undefined, "", "2025", "2025-13", "2025-00", "aug 2025"]) {
      expect(openedYear({ openedAt }), `accepted "${openedAt}"`).toBe("");
    }
  });

  it("every project that declares openedAt declares it readably", () => {
    for (const project of projects) {
      if (project.openedAt === undefined) continue;
      expect(openedYear(project), `${project.slug} has openedAt "${project.openedAt}"`).not.toBe(
        "",
      );
    }
  });
});
