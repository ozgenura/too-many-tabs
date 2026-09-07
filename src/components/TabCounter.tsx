import { projects } from "@/data/projects";

export function TabCounter() {
  const open = projects.length;

  const shipped = projects.filter((p) => p.status === "shipped").length;
  const going = projects.filter(
    (p) => p.status === "in progress" || p.status === "draft",
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-8 sm:pb-20">
      <p className="border-y border-border/60 py-3 font-mono text-[11px] tracking-wide text-muted-foreground sm:text-xs">
        {open} tabs open <span className="text-muted-foreground">·</span>{" "}
        <span className="text-accent">{shipped} shipped</span>{" "}
        <span className="text-muted-foreground">·</span> {going} still going
      </p>
    </div>
  );
}
