import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";

/** Small monospace "copy link" action for project detail headers. */
export function CopyProjectLink({ slug, className = "" }: { slug: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = () => {
    const url =
      typeof window === "undefined"
        ? `/projects/${slug}`
        : `${window.location.origin}/projects/${slug}`;
    navigator.clipboard?.writeText(url).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link to this project"
        className={
          "inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-accent " +
          className
        }
      >
        <Link2 className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span aria-hidden="true">{copied ? "copied ✓" : "copy link"}</span>
      </button>
      {/* Screen-reader equivalent of the visual "copied ✓" confirmation. */}
      <span aria-live="polite" role="status" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </>
  );
}
