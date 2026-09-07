import { Link } from "@tanstack/react-router";

export function WhySection() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-6 sm:px-8 sm:pb-8">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        why so many tabs
      </h2>
      <p className="mt-8 max-w-2xl text-base leading-relaxed text-foreground sm:text-lg">
        I've never been good at closing tabs. Some sit open for weeks while I keep turning them
        over. Others get built overnight because I couldn't wait. Not every tab becomes a project —
        but every project started as a tab I couldn't close. This is where the ones that made it
        live.
      </p>
    </section>
  );
}

export function AboutLink() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-8 sm:pb-28">
      <Link
        to="/about"
        className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-accent"
      >
        about:me <span aria-hidden>→</span>
      </Link>
    </div>
  );
}