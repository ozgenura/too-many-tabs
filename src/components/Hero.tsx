import { RotatingWord } from "./RotatingWord";

export function Hero() {
  return (
    <header className="mx-auto max-w-5xl px-4 pb-14 pt-20 sm:px-8 sm:pb-20 sm:pt-32">
      <h1 className="font-serif text-5xl font-normal leading-[1.02] tracking-tight text-foreground sm:text-7xl md:text-8xl">
        Too Many Tabs
      </h1>
      <div className="mt-5">
        <RotatingWord />
      </div>
      <p className="mt-12 max-w-xl border-l-2 border-accent/60 pl-5 text-sm italic leading-relaxed text-foreground sm:mt-16 sm:text-base">
        If it's not open in a tab, it doesn't exist. I don't bookmark ideas; I build them.
      </p>
    </header>
  );
}
