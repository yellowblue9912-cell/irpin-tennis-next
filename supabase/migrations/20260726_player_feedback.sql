create table if not exists public.player_comments (
  id uuid primary key default gen_random_uuid(),
  target_player_id uuid not null references public.players(id) on delete cascade,
  author_player_id uuid not null references public.players(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists player_comments_target_created_idx
  on public.player_comments (target_player_id, created_at desc);

alter table public.player_comments enable row level security;

drop policy if exists "Comments are public" on public.player_comments;
create policy "Comments are public"
on public.player_comments for select
to anon, authenticated
using (true);

drop policy if exists "Linked players can comment" on public.player_comments;
create policy "Linked players can comment"
on public.player_comments for insert
to authenticated
with check (
  exists (
    select 1 from public.players
    where players.id = author_player_id
      and players.user_id = auth.uid()
  )
);

drop policy if exists "Players can delete own comments" on public.player_comments;
create policy "Players can delete own comments"
on public.player_comments for delete
to authenticated
using (
  exists (
    select 1 from public.players
    where players.id = author_player_id
      and players.user_id = auth.uid()
  )
);

create table if not exists public.player_reactions (
  target_player_id uuid not null references public.players(id) on delete cascade,
  author_player_id uuid not null references public.players(id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (target_player_id, author_player_id)
);

alter table public.player_reactions enable row level security;

drop policy if exists "Reactions are public" on public.player_reactions;
create policy "Reactions are public"
on public.player_reactions for select
to anon, authenticated
using (true);

drop policy if exists "Linked players can react" on public.player_reactions;
create policy "Linked players can react"
on public.player_reactions for insert
to authenticated
with check (
  exists (
    select 1 from public.players
    where players.id = author_player_id
      and players.user_id = auth.uid()
  )
);

drop policy if exists "Linked players can change reaction" on public.player_reactions;
create policy "Linked players can change reaction"
on public.player_reactions for update
to authenticated
using (
  exists (
    select 1 from public.players
    where players.id = author_player_id
      and players.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.players
    where players.id = author_player_id
      and players.user_id = auth.uid()
  )
);
