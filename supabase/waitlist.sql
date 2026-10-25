-- Waitlist sign-ups from littleunknown.com (the bio-link page and each app page).
-- Anyone may add themselves; nobody can read the list through the public API.
-- Count sign-ups per app with the service key or psql:  select app, count(*) from waitlist group by app;
create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  app text not null check (app in ('calm-chess', 'lazy-gym-buddy', 'unknown', 'einbuergerungstest')),
  email text not null check (length(email) <= 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  source text check (length(source) <= 64),
  created_at timestamptz not null default now(),
  unique (app, email)
);

alter table public.waitlist enable row level security;
drop policy if exists "anyone can join" on public.waitlist;
create policy "anyone can join" on public.waitlist for insert to anon with check (true);
revoke all on public.waitlist from anon, authenticated;
grant insert (app, email, source) on public.waitlist to anon;
