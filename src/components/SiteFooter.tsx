import { HatGlasses, Linkedin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NotifyForm } from "./NotifyForm";
import { CopyEmail } from "./CopyEmail";
import { PanicButton } from "./PanicButton";
import { formatSiteDate, lastUpdated } from "@/data/site";

// Instagram is out until there is an account to point at. It shipped as
// href="#", which is a link that lies: it looks live, does nothing, and costs
// trust in the one place a visitor goes looking for a way to reach you.
const links = [{ label: "linkedin", href: "https://linkedin.com/in/ozgenuracun", Icon: Linkedin }];

export function SiteFooter({ onNewTab }: { onNewTab?: () => void }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-8">
        <div className="flex flex-col gap-6">
          <nav className="flex flex-wrap items-center gap-5">
            <CopyEmail />
            {/* Sits with the other icon links rather than in the keyboard-hint
                line below: on a phone this is the only way into the pages that
                are not tabs, so it should look like a destination, not a note. */}
            <Link
              to="/incognito"
              className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-accent"
            >
              <HatGlasses className="h-4 w-4 shrink-0" aria-hidden="true" />
              incognito
            </Link>
            {links.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-accent"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </a>
            ))}
            {onNewTab ? (
              <button
                type="button"
                onClick={onNewTab}
                className="font-mono text-xs text-accent transition-colors hover:text-accent/80"
              >
                open a tab →
              </button>
            ) : null}
          </nav>
          <div>
            <p className="font-mono text-[11px] text-muted-foreground">
              still open in another tab.{" "}
              <Link
                to="/err-too-many-tabs"
                className="text-muted-foreground transition-colors hover:text-accent"
              >
                not sure where this goes →
              </Link>
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              last tab opened: {formatSiteDate(lastUpdated)}
            </p>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              {/* The keyboard hint is desktop-only because the keys are: there is
                  no ⌘K button below sm and no "/" on a phone keyboard. It was
                  advertising two things a mobile visitor could not do. */}
              <span className="hidden sm:inline">
                ⌘K or / to jump <span className="text-muted-foreground">·</span>{" "}
              </span>
              <PanicButton />
            </p>
          </div>
        </div>
        <div className="sm:flex sm:justify-end">
          <NotifyForm />
        </div>
      </div>
    </footer>
  );
}
