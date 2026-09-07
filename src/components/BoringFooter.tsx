import { contactEmail } from "@/data/site";

export function BoringFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Contact</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>
            <a href={`mailto:${contactEmail}`} className="underline">
              {contactEmail}
            </a>
          </li>
          <li>
            <a href="#" className="underline">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
