import { describe, expect, it } from "vitest";

import { draftIdeas, graduatedDrafts } from "./drafts";
import { getProject } from "./projects";

describe("graduatedDrafts", () => {
  it("every entry points at a project that exists", () => {
    // Renaming a slug in projects.ts would otherwise silently empty this
    // section — and it is the only proof on /draft that the pipeline runs.
    for (const { slug } of graduatedDrafts) {
      expect(getProject(slug), `no project for slug "${slug}"`).toBeTruthy();
    }
  });

  it("does not leave a graduated line in the open list", () => {
    const open = new Set(draftIdeas);
    for (const { line } of graduatedDrafts) {
      expect(open.has(line), `"${line}" is both open and graduated`).toBe(false);
    }
  });
});
