import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { TabStrip } from "./TabStrip";
import { SiteFooter } from "./SiteFooter";
import { CommandPalette } from "./CommandPalette";
import { RestoreBar } from "./RestoreBar";
import { InquiryModal } from "./InquiryModal";
import { useLateNight } from "@/hooks/use-late-night";
import { useIdle } from "@/hooks/use-idle";
import { CloudCluster } from "./CloudCluster";
import { EggStatusToasts } from "./EggStatusToasts";
import { useBoringMode } from "@/hooks/use-boring-mode";
import { closeInquiry, openInquiry, useInquiryOpen, useInquiryPrefill } from "@/hooks/use-inquiry";
import { BoringFooter } from "./BoringFooter";
import { track } from "@/lib/analytics";

const AWAY_TITLE = "(99+) Don't close this tab — let's build";

export function PageFrame({
  children,
  restore = false,
  slashPalette = true,
  exemptBoring = false,
}: {
  children: ReactNode;
  restore?: boolean;
  slashPalette?: boolean;
  /** Pages that must always render the real design language (e.g. /press-kit). */
  exemptBoring?: boolean;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const inquiryOpen = useInquiryOpen();
  const inquiryPrefill = useInquiryPrefill();
  useLateNight();
  const idle = useIdle();
  const [boringPref] = useBoringMode();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const boring = exemptBoring ? false : boringPref;

  // One place instead of four: the palette opens from ⌘K, "/", the tab strip
  // and the command list, and all of them land here.
  useEffect(() => {
    if (paletteOpen) track("palette_open");
  }, [paletteOpen]);

  useEffect(() => {
    if (!exemptBoring) return;
    const root = document.documentElement;
    const had = root.classList.contains("boring");
    if (had) root.classList.remove("boring");
    return () => {
      if (had) root.classList.add("boring");
    };
  }, [exemptBoring, boringPref]);

  useEffect(() => {
    const isTyping = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (slashPalette && e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (isTyping(e.target)) return;
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slashPalette]);

  useEffect(() => {
    let original = document.title;
    const onHidden = () => {
      if (document.visibilityState === "hidden") {
        original = document.title === AWAY_TITLE ? original : document.title;
        document.title = AWAY_TITLE;
      } else {
        document.title = original;
      }
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      if (document.title === AWAY_TITLE) document.title = original;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TabStrip
        onOpenPalette={() => setPaletteOpen(true)}
        onNewTab={openInquiry}
        sleeping={boring ? false : idle}
      />
      {restore && !boring ? <RestoreBar /> : null}
      <main className="flex-1">{children}</main>
      {boring ? <BoringFooter /> : <SiteFooter onNewTab={openInquiry} />}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onBookSession={openInquiry}
      />
      <InquiryModal open={inquiryOpen} onClose={closeInquiry} prefill={inquiryPrefill} />
      {boring ? null : <CloudCluster routeKey={pathname} />}
      <EggStatusToasts />
    </div>
  );
}
