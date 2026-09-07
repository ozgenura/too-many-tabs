import type { Screenshot } from "@/data/projects";
import { ProjectScreenshot } from "./ProjectScreenshot";

type Props = {
  slug: string;
  name: string;
  screenshots?: Screenshot[] | undefined;
  className?: string;
};

const layers = [
  { x: 18, y: -18, rotate: 2, opacity: 0.7, hoverOpacity: 0.76, z: 1 },
  { x: 9, y: -9, rotate: -2, opacity: 0.85, hoverOpacity: 0.9, z: 2 },
];

/** Scrim color derived from the theme background + the tweakable alpha token. */
const scrim =
  "color-mix(in oklab, var(--background) calc(var(--peeking-scrim-alpha) * 100%), transparent)";

export function ProjectScreenshotStack({ slug, name, screenshots = [], className = "" }: Props) {
  const shots = screenshots.slice(0, 3);
  const behind = shots.slice(1);

  if (behind.length === 0) {
    return (
      <ProjectScreenshot slug={slug} name={name} screenshots={shots} className={className} />
    );
  }

  // Deepest layer first so DOM order matches visual stacking.
  const behindLayers = behind
    .map((shot, i) => ({ shot, ...layers[behind.length - 1 - i]! }))
    .sort((a, b) => a.z - b.z);

  return (
    <div className={"relative pr-5 pt-5 " + className}>
      <div className="relative">
        {behindLayers.map(({ shot, x, y, rotate, opacity, hoverOpacity, z }, i) => (
          <div
            key={shot.url + i}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-lg rounded-tl-lg rounded-tr-3xl border border-border bg-card opacity-[var(--layer-opacity)] saturate-50 transition-opacity duration-200 ease-out group-hover:opacity-[var(--layer-opacity-hover)]"
            style={{
              transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
              zIndex: z,
              "--layer-opacity": opacity,
              "--layer-opacity-hover": hoverOpacity,
            } as React.CSSProperties}
          >
            <img src={shot.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            <div
              className="absolute inset-0 transition-[background-color,background] duration-200 ease-out group-hover:[--peeking-scrim-alpha:var(--peeking-scrim-alpha-hover)]"
              style={{ background: scrim }}
            />
          </div>
        ))}
        <div className="relative z-10">
          <ProjectScreenshot slug={slug} name={name} screenshots={shots.slice(0, 1)} />
        </div>
      </div>
    </div>
  );
}
