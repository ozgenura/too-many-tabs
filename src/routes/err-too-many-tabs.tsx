import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/NotFoundPage";

export const Route = createFileRoute("/err-too-many-tabs")({
  component: NotFoundPage,
});