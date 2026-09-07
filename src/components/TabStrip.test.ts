import { describe, expect, it } from "vitest";

import { closingSessionTab } from "./TabStrip";

describe("closingSessionTab", () => {
  it("closes the session tab that is being replaced", () => {
    expect(closingSessionTab("/all-projects", "/draft")?.to).toBe("/all-projects");
  });

  it("closes nothing on the first session tab of a visit", () => {
    // The strip starts with no dynamic tab, so the first one replaces nothing.
    expect(closingSessionTab(null, "/draft")).toBeNull();
  });

  it("closes nothing when the same tab is re-entered", () => {
    expect(closingSessionTab("/draft", "/draft")).toBeNull();
  });

  it("closes nothing for a path that was never a tab", () => {
    // Project pages are not tabs; navigating away from one closes nothing.
    expect(closingSessionTab("/projects/creditboard", "/draft")).toBeNull();
  });
});
