/**
 * Writes public/sitemap.xml from the project data, so a new project is listed
 * the moment it lands in src/data/projects.ts.
 *
 * Runs as part of `bun run build`. Kept as a build step rather than a server
 * route because every page on this site is static content — the sitemap can be
 * a plain file, which also survives a move to fully prerendered hosting.
 */
import { writeFile } from "node:fs/promises";

import { projects } from "../src/data/projects";

const SITE_URL = (process.env["VITE_SITE_URL"] ?? "https://toomanytabs.dev").replace(/\/$/, "");

/**
 * Deliberately excluded: /localhost (serves its own noindex) and
 * /err-too-many-tabs (the 404 game — reached by accident, not by search).
 */
const STATIC_PATHS = ["/", "/work", "/about", "/all-projects", "/notes", "/draft", "/press-kit"];

const paths = [...STATIC_PATHS, ...projects.map((project) => `/projects/${project.slug}`)];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>${SITE_URL}${path === "/" ? "" : path}</loc></url>`),
  "</urlset>",
  "",
].join("\n");

await writeFile(new URL("../public/sitemap.xml", import.meta.url), xml, "utf8");
console.log(`sitemap.xml: ${paths.length} URL → ${SITE_URL}`);
