import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/PageFrame";
import { Hero } from "@/components/Hero";
import { StatusLine } from "@/components/StatusLine";
import { TabCounter } from "@/components/TabCounter";
import { NowBlock } from "@/components/NowBlock";
import { ProjectGrid } from "@/components/ProjectGrid";
import { NotesTeaser } from "@/components/NotesTeaser";
import { ClosedTabs } from "@/components/ClosedTabs";

import { WhySection, AboutLink } from "@/components/About";
import { BoringHome } from "@/components/BoringHome";
import { useBoringMode } from "@/hooks/use-boring-mode";
import { tagline } from "@/data/site";
import { SITE_URL } from "@/data/site-config";

const title = `Too Many Tabs — ${tagline}`;
const description =
  "Personal project shelf of someone who works in procurement excellence: spend data, process, data and AI experiments, and things shipped instead of bookmarked.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

function Index() {
  const [boring] = useBoringMode();

  return (
    <PageFrame restore={!boring}>
      {boring ? (
        <BoringHome />
      ) : (
        <>
          <Hero />
          <WhySection />
          <AboutLink />
          <StatusLine />
          <TabCounter />
          <NowBlock />
          {/* proof → thinking → judgement */}
          <ProjectGrid />
          <NotesTeaser />
          <ClosedTabs />
        </>
      )}
    </PageFrame>
  );
}
