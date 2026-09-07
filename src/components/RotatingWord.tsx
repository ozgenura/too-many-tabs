import { useEffect, useState } from "react";

import { taglineWords as words } from "@/data/site";
const INTERVAL = 3500;
const FADE = 400;

export function RotatingWord() {
  // Always starts on the anchor (words[0]) and rotates from there. It used to
  // jump to a random word on mount, which meant the one line the site commits
  // to in its title and link previews was on screen a quarter of the time.
  // Starting deterministically also keeps the SSR HTML meaningful.
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // The cross-fade runs under reduced motion too: it is opacity, nothing
  // moves. Snapping the word instead was one of the things that made the
  // page feel like a screenshot of itself.
  useEffect(() => {
    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setVisible(true);
      }, FADE);
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className="font-mono text-base text-muted-foreground sm:text-lg">
      build without{" "}
      <span
        className={
          "text-accent transition-opacity duration-[400ms] ease-in-out " +
          (visible ? "opacity-100" : "opacity-0")
        }
      >
        {words[index]}
      </span>
      <span className="text-muted-foreground">.</span>
      <span
        aria-hidden="true"
        className="ml-1 inline-block h-[1em] w-[0.5em] translate-y-[0.12em] bg-accent/80 motion-safe:animate-blink"
      />
    </p>
  );
}
