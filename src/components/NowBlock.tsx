import { nowLines } from "@/data/site";

export function NowBlock() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-8 sm:pb-32">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">now</h2>
      <ul className="mt-8 space-y-3">
        {nowLines.map((line) => (
          <li key={line} className="flex gap-3 font-mono text-[13px] leading-6 text-foreground">
            <span aria-hidden className="text-accent/70">
              &gt;
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
