create table if not exists public.player_profile_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_player_id uuid references public.players(id) on delete set null,
  requested_name text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint player_profile_claims_target_check check (
    (requested_player_id is not null and requested_name is null)
    or (requested_player_id is null and requested_name is not null
        and length(trim(requested_name)) between 2 and 100)
  )
);

create unique index if not exists player_profile_claims_one_pending_per_user
  on public.player_profile_claims(user_id)
  where status = 'pending';
create index if not exists player_profile_claims_pending_created_idx
  on public.player_profile_claims(created_at)
  where status = 'pending';

alter table public.player_profile_claims enable row level security;
grant select, insert on public.player_profile_claims to authenticated;
grant select, insert, update, delete on public.player_profile_claims to service_role;

create policy "Players read their own profile claims"
on public.player_profile_claims
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Players request their own profile claim"
on public.player_profile_claims
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and status = 'pending'
  and reviewed_at is null
  and (
    (requested_player_id is not null and requested_name is null and exists (
      select 1 from public.players p
      where p.id = requested_player_id
        and p.is_active = true
        and p.user_id is null
    ))
    or (requested_player_id is null and requested_name is not null
        and length(trim(requested_name)) between 2 and 100)
  )
);

revoke update, delete on public.player_profile_claims from anon, authenticated;
