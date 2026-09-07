import { useEffect, useState } from "react";
import { notifyEgg } from "@/lib/egg-events";

export function PanicButton() {
  const [blank, setBlank] = useState(false);

  useEffect(() => {
    if (!blank) return;
    const id = window.setTimeout(() => {
      setBlank(false);
      // Routed through the egg notifier rather than a plain toast, so every
      // egg looks the same on screen and lands in the same analytics event.
      notifyEgg("panic", "session restored", "good ideas don't close that easily");
    }, 800);
    return () => window.clearTimeout(id);
  }, [blank]);

  return (
    <>
      <button
        type="button"
        onClick={() => setBlank(true)}
        className="font-mono text-[11px] text-muted-foreground transition-colors hover:text-accent"
      >
        Close All Tabs
      </button>
      {blank ? (
        <div
          aria-hidden
          className="fixed inset-0 z-[60] flex items-start justify-start bg-background transition-opacity"
        >
          <span className="px-4 py-3 font-mono text-[11px] text-muted-foreground">about:blank</span>
        </div>
      ) : null}
    </>
  );
}
