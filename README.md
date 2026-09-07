# Too Many Tabs

**[toomanytabs.dev](https://toomanytabs.dev)**

A shelf for the things I build. Projects are tabs; the ones that never closed
are the ones that made it.

## What this is

It started as a prompt. An AI builder turned it into a working site in an
afternoon and then kept going: an admin panel, authentication, a database,
thirteen migrations, an audit log.

What all of it was for was that one person — me — could edit six paragraphs from
a browser. The screenshot uploader had never held a single image. The audit log
was recording my own typing.

So it came apart. The content moved into files where it can be reviewed in a
diff, the backend shrank to the two things visitors actually write, and roughly
half the code stopped existing. This repository is what survived.

## Stack

- **TanStack Start** (React 19, Vite) — SSR and file-based routing
- **Cloudflare Workers** — hosting and custom domain, no build server
- **Supabase** over plain PostgREST, no client SDK — three insert-only tables
- **Tailwind v4** with `oklch()` design tokens
- **Bun** — package manager, runtime, test runner

## Content lives in files

There is no CMS. Every project, note and draft is a file:

| What | Where |
| --- | --- |
| Projects and screenshots | `src/data/projects.ts` |
| `notes.md` entries | `src/content/notes.md` |
| Draft one-liners | `src/data/drafts.ts` |
| Tagline, closed tabs, about copy | `src/data/site.ts` |
| What I take on | `src/data/work.ts` |
| Tabs in the strip | `src/data/tabs.ts` |

Publishing is a commit. That was the whole point of deleting the admin panel:
every change to what the site says is now reviewable as a diff.

`/press-kit` is a living style reference — it reads the same tokens the site
does, so it cannot drift from the real thing.

## Running it

```sh
bun install
cp .env.example .env
bun run dev          # http://localhost:8080
```

```sh
bun run typecheck
bun run test         # vitest — note it does not typecheck, run both
bun run test:e2e     # playwright, currently the 404 tab-dodge game
bun run lint
bun run deploy       # builds, then wrangler deploy to Cloudflare Workers
```

Nothing secret is needed to run the site. The Supabase values in `.env.example`
are publishable keys — the kind that ship in the client bundle by design — and
without them the two forms simply fail while everything else works.

## The backend, in full

Three tables, insert only, with no read access from the browser:

- `email_subscribers` — the notify form
- `feedback` — the "open a tab" form
- `events` — first-party analytics, seven allow-listed event names

Row-level security does the validation, including the allow-list.
`supabase/schema.sql` is the entire backend.

## Things that look like mistakes and are not

- **Tab numbers are permanent.** They are archive numbers, not positions, and
  they are never renumbered. Gaps mean a tab was closed.
- **Project screenshots must be 16:9.** The frame is `object-cover`; anything
  off-ratio silently loses its edges.
- **Boring mode and the session tab are not persisted.** They are modes you
  switch into, not preferences you set — so a real page load resets them.
- **Reduced motion removes movement, not fades.** Opacity and colour
  transitions stay, because that is not what the setting is about.
- **`/incognito` is `noindex` even after launch.** A page called incognito that
  turns up in search results is a page that did not mean it.

## Licence

The code is here to read and borrow from. The writing, screenshots and design
are not — those are the site.
