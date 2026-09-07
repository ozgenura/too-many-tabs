import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { TabDodgeGame } from "./TabDodgeGame";
import { useEggSettings } from "@/hooks/use-egg-settings";
import { notifyEgg } from "@/lib/egg-events";

/** Announced once per session: coming back here should not re-announce it. */
let announced = false;

export function NotFoundPage() {
  const { effective } = useEggSettings();

  // Reached deliberately (the "a tab I swear I closed" link) or by accident —
  // either way there is a game here, and it should say so rather than hoping
  // the visitor scrolls into it.
  useEffect(() => {
    if (!effective.gameEnabled || announced) return;
    announced = true;
    notifyEgg("game", "easter egg: err_too_many_tabs", "there is a game on this page");
  }, [effective.gameEnabled]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-subtle">
          404 · not found
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight text-accent sm:text-6xl">
          ERR_TOO_MANY_TABS
        </h1>
        <p className="mt-3 max-w-md font-mono text-sm text-muted-foreground">
          this tab never existed. probably for the best.
        </p>

        {effective.gameEnabled ? (
          <div className="mt-10">
            <TabDodgeGame />
          </div>
        ) : null}

        <p className="mt-10 font-mono text-xs text-muted-foreground">
          <Link to="/" className="text-accent transition-colors hover:text-accent/80">
            ← back to too-many-tabs
          </Link>
        </p>
      </main>
    </div>
  );
}
