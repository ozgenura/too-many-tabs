-- Too Many Tabs — the entire backend.
--
-- All site content lives in the repo (src/data, src/content). The database
-- exists only for the two things visitors write: the notify list and feedback.
-- There is no auth, no roles, no admin API surface — rows are read from the
-- Supabase dashboard, so neither anon nor authenticated gets SELECT.
--
-- Run once in the Supabase SQL editor. Safe to re-run.

-- ---------------------------------------------------------------- subscribers

create table if not exists public.email_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  submitted_at timestamptz not null default now()
);

-- One row per address; a repeat signup fails with 23505, which the site
-- deliberately treats as success (see src/lib/subscribe.ts).
create unique index if not exists email_subscribers_email_lower_idx
  on public.email_subscribers (lower(email));

alter table public.email_subscribers enable row level security;

revoke all on public.email_subscribers from anon, authenticated;
grant insert on public.email_subscribers to anon;
grant all on public.email_subscribers to service_role;

drop policy if exists "Anyone can subscribe" on public.email_subscribers;
create policy "Anyone can subscribe"
  on public.email_subscribers for insert to anon
  with check (
    length(email) between 5 and 255
    and email = lower(btrim(email))
    and email ~ '^[^@\s]+@[^@\s.]+\.[^@\s]+$'
  );

-- --------------------------------------------------------------------- events

-- A handful of named events (see src/lib/analytics.ts). No IP, no cookie; the
-- session id is a random per-tab value from sessionStorage that dies with the
-- tab, so nothing here identifies a person or links two visits.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  path text,
  session_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_name_idx on public.events (name, created_at desc);

alter table public.events enable row level security;

revoke all on public.events from anon, authenticated;
grant insert on public.events to anon;
grant all on public.events to service_role;

-- The allow-list is the point: an open insert endpoint should not accept
-- arbitrary rows, only the events this site actually emits.
drop policy if exists "Anyone can record a known event" on public.events;
create policy "Anyone can record a known event"
  on public.events for insert to anon
  with check (
    name in (
      'page_view',
      'projects_seen',
      'project_open',
      'palette_open',
      'notify_submit',
      'inquiry_submit',
      'egg_triggered'
    )
    and (path is null or length(path) <= 512)
    and (session_id is null or length(session_id) <= 64)
    and (meta is null or length(meta::text) <= 1000)
  );

-- ------------------------------------------------------------------- feedback

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  email text,
  submitted_at timestamptz not null default now()
);

create index if not exists feedback_submitted_at_idx
  on public.feedback (submitted_at desc);

alter table public.feedback enable row level security;

revoke all on public.feedback from anon, authenticated;
grant insert on public.feedback to anon;
grant all on public.feedback to service_role;

drop policy if exists "Anyone can send feedback" on public.feedback;
create policy "Anyone can send feedback"
  on public.feedback for insert to anon
  with check (
    length(btrim(message)) between 2 and 4000
    and (
      email is null
      or (length(email) between 5 and 255 and email ~ '^[^@\s]+@[^@\s.]+\.[^@\s]+$')
    )
  );
