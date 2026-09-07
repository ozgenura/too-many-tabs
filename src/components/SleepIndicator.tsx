/**
 * Accessible "tab sleeping" indicator. The live region announces the state
 * change once; the visual text stays muted and unobtrusive.
 */
export function SleepIndicator({ sleeping }: { sleeping: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid="sleep-indicator"
      className="mb-1.5 shrink-0"
    >
      {sleeping ? (
        <>
          <span aria-hidden="true" className="font-mono text-[10px] text-subtle">
            tab sleeping · zzz
          </span>
          <span className="sr-only">This tab is idle and sleeping. Move or press a key to wake it.</span>
        </>
      ) : null}
    </div>
  );
}
