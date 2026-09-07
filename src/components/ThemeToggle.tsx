import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const [theme, set] = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => set(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="mb-1.5 inline-flex shrink-0 items-center gap-1.5 rounded border border-border/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
    >
      {theme === "dark" ? (
        <Sun className="h-3 w-3 shrink-0" aria-hidden />
      ) : (
        <Moon className="h-3 w-3 shrink-0" aria-hidden />
      )}
      <span className="hidden sm:inline">{next}</span>
    </button>
  );
}
