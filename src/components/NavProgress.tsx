/**
 * The thin line a browser draws under its tab strip while a page loads.
 *
 * Borrowed on purpose: it is the one piece of motion every visitor already
 * knows how to read, and it lands exactly where the site had no pulse at all.
 * Under reduced motion it does not sweep — it fades in and out in place.
 */
export function NavProgress({ active }: { active: boolean }) {
  return (
    <div aria-hidden className="relative h-0.5 w-full overflow-hidden">
      {active ? (
        <span className="absolute inset-y-0 left-0 w-full origin-left bg-accent/70 animate-nav-progress" />
      ) : null}
    </div>
  );
}
