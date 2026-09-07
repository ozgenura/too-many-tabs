import { useEffect, useState } from "react";
import { subscribeEggEvents, type EggEvent } from "@/lib/egg-events";

const VISIBLE_MS = 4500;

/**
 * Small on-screen status notifications for triggered easter eggs
 * (tab sleeping, wandering sprite, settings changes).
 */
export function EggStatusToasts() {
  const [items, setItems] = useState<EggEvent[]>([]);

  useEffect(() => {
    const timers: number[] = [];
    const off = subscribeEggEvents((event) => {
      setItems((prev) => [...prev.slice(-2), event]);
      timers.push(
        window.setTimeout(
          () => setItems((prev) => prev.filter((i) => i.id !== event.id)),
          VISIBLE_MS,
        ),
      );
    });
    return () => {
      off();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="egg-status-toasts"
      className="pointer-events-none fixed bottom-3 right-3 z-50 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col gap-2"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-sm border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm"
        >
          <p className="font-mono text-[11px] text-accent">{item.message}</p>
          {item.detail ? (
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{item.detail}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
