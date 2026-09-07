import { FileText } from "lucide-react";
import { useBoringMode } from "@/hooks/use-boring-mode";

export function BoringToggle() {
  const [on, set] = useBoringMode();

  return (
    <button
      type="button"
      onClick={() => set(!on)}
      aria-pressed={on}
      aria-label={on ? "Leave boring mode" : "Switch to boring mode"}
      title={on ? "Leave boring mode" : "Switch to boring mode"}
      className={
        "mb-1.5 inline-flex shrink-0 items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors " +
        (on
          ? "border-foreground/40 text-foreground"
          : "border-border/60 text-muted-foreground hover:border-accent/50 hover:text-accent")
      }
    >
      <FileText className="h-3 w-3 shrink-0" aria-hidden />
      {/* Names where the click takes you, not where you are — same rule as the
          theme toggle, which reads "light" while you are in the dark. Aimed at
          the site, not at the visitor: someone who picked the plain layout may
          have picked it on purpose. */}
      <span className="hidden sm:inline">{on ? "the fun one" : "boring mode"}</span>
    </button>
  );
}
