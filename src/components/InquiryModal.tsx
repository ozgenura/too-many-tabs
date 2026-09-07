import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { sendInquiry } from "@/lib/backend";
import { track } from "@/lib/analytics";

export function InquiryModal({
  open,
  onClose,
  prefill = "",
}: {
  open: boolean;
  onClose: () => void;
  prefill?: string;
}) {
  const [brief, setBrief] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    // Seeded by whoever opened the modal (a rolled draft line, say). Runs only
    // when the modal opens, so it can never overwrite something half-typed.
    if (prefill) setBrief(prefill);
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, prefill]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 px-4 pb-6 backdrop-blur-sm sm:items-center sm:pb-0"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="new-session.draft"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
          <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
            new-session.draft
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>
        <form
          className="px-5 py-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (sending) return;
            const message = brief.trim();
            if (!message) {
              setError("write a line or two first.");
              firstRef.current?.focus();
              return;
            }
            setSending(true);
            setError(null);
            try {
              await sendInquiry(message, email);
            } catch (cause) {
              console.error(cause);
              setSending(false);
              setError("couldn't send that. try again in a bit.");
              return;
            }
            setSending(false);
            track("inquiry_submit", { withEmail: Boolean(email.trim()) });
            toast("Tab opened. I'll get back to you.", {
              description: email.trim() ? `replying to ${email.trim()}` : undefined,
            });
            setBrief("");
            setEmail("");
            onClose();
          }}
        >
          <label htmlFor="brief" className="block font-mono text-xs text-muted-foreground">
            what are we building?
          </label>
          <textarea
            id="brief"
            ref={firstRef}
            rows={4}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="a tool, a cleanup, a half-formed idea…"
            className="mt-3 w-full resize-none rounded-md border border-border bg-background/60 px-3 py-2 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-accent/60 focus:outline-none"
          />
          <label htmlFor="inquiry-email" className="mt-5 block font-mono text-xs text-muted-foreground">
            your email
          </label>
          <input
            id="inquiry-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-3 w-full rounded-md border border-border bg-background/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent/60 focus:outline-none"
          />
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] text-muted-foreground" aria-live="polite">
              {error ?? "esc to close"}
            </p>
            <button
              type="submit"
              disabled={sending}
              className="rounded-md border border-accent/50 px-4 py-2 font-mono text-xs text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
            >
              {sending ? "sending…" : "Ship this tab →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
