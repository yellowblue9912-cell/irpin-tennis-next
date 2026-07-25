-- Run once in the Supabase SQL editor before publishing player accounts.
-- Private contact data is deliberately stored outside public.players.

alter table public.players
  add column if not exists user_id uuid unique references auth.users(id) on delete set null,
  add column if not exists bio text;

create table if not exists public.player_private_profiles (
  player_id uuid primary key references public.players(id) on delete cascade,
  phone text,
  address text,
  birth_date date,
  phone_public boolean not null default false,
  address_public boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.players enable row level security;
alter table public.player_private_profiles enable row level security;

drop policy if exists "Public can read players" on public.players;
create policy "Public can read players"
on public.players for select
to anon, authenticated
using (true);

drop policy if exists "Players can update their own profile" on public.players;
create policy "Players can update their own profile"
on public.players for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Players can read their private profile" on public.player_private_profiles;
create policy "Players can read their private profile"
on public.player_private_profiles for select
to authenticated
using (
  exists (
    select 1 from public.players
    where players.id = player_id and players.user_id = auth.uid()
  )
);

drop policy if exists "Players can create their private profile" on public.player_private_profiles;
create policy "Players can create their private profile"
on public.player_private_profiles for insert
to authenticated
with check (
  exists (
    select 1 from public.players
    where players.id = player_id and players.user_id = auth.uid()
  )
);

drop policy if exists "Players can update their private profile" on public.player_private_profiles;
create policy "Players can update their private profile"
on public.player_private_profiles for update
to authenticated
using (
  exists (
    select 1 from public.players
    where players.id = player_id and players.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.players
    where players.id = player_id and players.user_id = auth.uid()
  )
);

create or replace view public.public_player_contacts
with (security_invoker = false)
as
select
  player_id,
  case when phone_public then phone else null end as phone,
  case when address_public then address else null end as address,
  phone_public,
  address_public
from public.player_private_profiles;

revoke all on public.player_private_profiles from anon;
grant select, insert, update on public.player_private_profiles to authenticated;
grant select on public.public_player_contacts to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'player-avatars', 'player-avatars', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'player-avatars'
  and exists (
    select 1 from public.players
    where players.user_id = auth.uid()
      and players.id::text = (storage.foldername(name))[1]
  )
);

drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'player-avatars'
  and exists (
    select 1 from public.players
    where players.user_id = auth.uid()
      and players.id::text = (storage.foldername(name))[1]
  )
)
with check (
  bucket_id = 'player-avatars'
  and exists (
    select 1 from public.players
    where players.user_id = auth.uid()
      and players.id::text = (storage.foldername(name))[1]
  )
);

-- After registration, link an existing player card:
-- update public.players
-- set user_id = (select id from auth.users where email = 'player@example.com')
-- where slug = 'player-slug';
