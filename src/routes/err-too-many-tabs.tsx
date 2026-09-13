import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/NotFoundPage";

export const Route = createFileRoute("/err-too-many-tabs")({
  head: () => ({
    meta: [
      { title: "ERR_TOO_MANY_TABS — Too Many Tabs" },
      // Noindex on its own, not just while the site is unlisted. This page is
      // meant to be found by clicking something odd, and an easter egg that
      // turns up in search results has stopped being one — the same reason
      // /incognito is noindex. It is deliberately absent from sitemap.xml too.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NotFoundPage,
});
