import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { contactEmail } from "@/data/site";

export function CopyEmail() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <a
      href={`mailto:${contactEmail}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigator.clipboard?.writeText(contactEmail).then(
          () => setCopied(true),
          () => {
            window.location.href = `mailto:${contactEmail}`;
          },
        );
      }}
      className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-accent"
    >
      <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
      {/* The address itself, not the word "email": on a domain you own it is
          half the credential, and hiding it behind a click wasted that. */}
      <span aria-live="polite">{copied ? "copied ✓" : contactEmail}</span>
    </a>
  );
}
