export function LateNightBadge() {
  return (
    <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
      Late night browser session active
    </span>
  );
}
