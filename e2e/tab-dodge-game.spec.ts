import { expect, test } from "@playwright/test";

const NOT_FOUND_URL = "/this-route-does-not-exist";
const IDLE_TIMEOUT_MS = 3 * 60 * 1000;

test.describe("ERR_TOO_MANY_TABS mini-game", () => {
  test("loads on the 404 page with score, best tracker and instructions", async ({ page }) => {
    await page.goto(NOT_FOUND_URL);

    await expect(page.getByRole("heading", { name: "ERR_TOO_MANY_TABS" })).toBeVisible();

    const board = page.getByTestId("game-board");
    await expect(board).toBeVisible();
    await expect(page.getByTestId("game-score")).toContainText("tabs cleared: 0");
    await expect(page.getByTestId("game-best")).toContainText("best:");

    // aria-describedby points at the keyboard instructions.
    const describedBy = await board.getAttribute("aria-describedby");
    expect(describedBy).toBe("tab-dodge-instructions");
    await expect(page.locator("#tab-dodge-instructions")).toContainText("Press P to pause");
  });

  test("can be started, paused and restarted from the keyboard", async ({ page }) => {
    await page.goto(NOT_FOUND_URL);
    const board = page.getByTestId("game-board");
    // Retry the start key until hydration has attached the keyboard handlers.
    await expect
      .poll(async () => {
        await board.press("Space");
        return board.getAttribute("data-state");
      })
      .toBe("playing");
    // Jumping keeps focus on the board so keyboard control never gets lost.
    await expect(board).toBeFocused();

    await page.keyboard.press("p");
    await expect(board).toHaveAttribute("data-state", "paused");
    await expect(page.getByTestId("game-status")).toContainText("paused");
    await expect(board).toBeFocused();

    await page.keyboard.press("p");
    await expect(board).toHaveAttribute("data-state", "playing");

    await page.keyboard.press("r");
    await expect(board).toHaveAttribute("data-state", "playing");
    await expect(page.getByTestId("game-score")).toContainText("tabs cleared: 0");
    await expect(board).toBeFocused();
  });

  test("persists the best record in localStorage per browser", async ({ page }) => {
    await page.goto(NOT_FOUND_URL);
    await page.evaluate(() =>
      window.localStorage.setItem(
        "tmt.game.best.v1",
        JSON.stringify({ bestScore: 12, bestTimeMs: 42_000 }),
      ),
    );
    await page.reload();

    await expect(page.getByTestId("game-best")).toContainText("best: 12 tabs");
    await expect(page.getByTestId("game-best")).toContainText("42.0s");
  });

  test("shows the accessible sleep indicator after 3 minutes of inactivity", async ({ page }) => {
    await page.clock.install();
    await page.goto("/", { waitUntil: "networkidle" });
    // Let hydration register the idle timer before advancing the fake clock.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset["hydrated"]), {
        timeout: 30_000,
      })
      .toBe("1");

    const indicator = page.getByTestId("sleep-indicator");
    await expect(indicator).toHaveAttribute("aria-live", "polite");
    await expect(indicator).not.toContainText("tab sleeping");

    await page.clock.runFor(IDLE_TIMEOUT_MS + 1_000);

    await expect(indicator).toContainText("tab sleeping");
    await expect(page.getByRole("status").filter({ hasText: "idle and sleeping" })).toHaveCount(1);
    await expect(page.locator("html.tab-sleeping")).toHaveCount(1);
  });
});
