import { useSyncExternalStore } from "react";

/**
 * The "open a tab" modal is owned by PageFrame but opened from several places —
 * the tab strip, the footer, the command palette and now /work. Same
 * module-level store pattern as use-theme / use-boring-mode, so a page deep in
 * the tree can open it without prop-drilling through the frame.
 */
let open = false;
let prefill = "";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function set(next: boolean) {
  if (open === next) return;
  open = next;
  notify();
}

export function openInquiry() {
  prefill = "";
  set(true);
}

/**
 * Opens the modal with the brief already started. Separate from `openInquiry`
 * on purpose: that one is wired straight to onClick handlers, which would pass
 * a MouseEvent into a `prefill` parameter.
 */
export function openInquiryWith(text: string) {
  prefill = text;
  // The text can change while the modal is already open, and a no-op `set`
  // would not tell anyone about it.
  if (open) notify();
  set(true);
}

export function closeInquiry() {
  set(false);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => open;
/** Always closed during SSR; it is a user action, never an initial state. */
const getServerSnapshot = () => false;

export function useInquiryOpen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const getPrefill = () => prefill;
const getServerPrefill = () => "";

/** Kept as its own primitive snapshot — returning `{open, prefill}` would be a
 * fresh object every read and re-render forever. */
export function useInquiryPrefill(): string {
  return useSyncExternalStore(subscribe, getPrefill, getServerPrefill);
}
