alter table public.players
  add column if not exists rating_base numeric;

update public.players p
set rating_base = greatest(
  1,
  least(
    7,
    coalesce(p.rating, 3.0) - coalesce((
      select sum(h.rating_change)
      from (
        select rating_change
        from public.player_rating_history
        where player_id = p.id
        order by event_date desc, created_at desc
        limit 30
      ) h
    ), 0)
  )
)
where rating_base is null;

alter table public.players
  alter column rating_base set default 3.0;

create table if not exists public.rating_matches (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references public.players(id) on delete cascade,
  opponent_id uuid not null references public.players(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'result_pending', 'confirmed', 'declined', 'cancelled')),
  submitted_by_player_id uuid references public.players(id) on delete set null,
  winner_id uuid references public.players(id) on delete set null,
  player1_set1 smallint,
  player2_set1 smallint,
  player1_set2 smallint,
  player2_set2 smallint,
  player1_set3 smallint,
  player2_set3 smallint,
  played_at date,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  result_submitted_at timestamptz,
  confirmed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint rating_matches_different_players check (challenger_id <> opponent_id)
);

create index if not exists rating_matches_challenger_idx
  on public.rating_matches(challenger_id, created_at desc);
create index if not exists rating_matches_opponent_idx
  on public.rating_matches(opponent_id, created_at desc);
create index if not exists rating_matches_confirmed_idx
  on public.rating_matches(status, played_at desc);

alter table public.player_rating_history
  drop constraint if exists player_rating_history_source_type_check;
alter table public.player_rating_history
  add constraint player_rating_history_source_type_check
  check (source_type in ('tournament', 'league', 'rating_match'));

alter table public.rating_matches enable row level security;

drop policy if exists "Participants see rating matches" on public.rating_matches;
create policy "Participants see rating matches"
on public.rating_matches
for select
using (
  status = 'confirmed'
  or exists (
    select 1
    from public.players p
    where p.user_id = auth.uid()
      and p.id in (challenger_id, opponent_id)
  )
);

create or replace function public.current_player_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.players where user_id = auth.uid() limit 1;
$$;

create or replace function public.create_rating_challenge(p_opponent_id uuid)
returns public.rating_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid := public.current_player_id();
  v_match public.rating_matches;
begin
  if v_player_id is null then
    raise exception 'PLAYER_NOT_LINKED';
  end if;
  if p_opponent_id = v_player_id then
    raise exception 'CANNOT_CHALLENGE_SELF';
  end if;
  if not exists (
    select 1 from public.players
    where id = p_opponent_id and user_id is not null and is_active = true
  ) then
    raise exception 'OPPONENT_NOT_AVAILABLE';
  end if;
  if exists (
    select 1 from public.rating_matches
    where status in ('pending', 'accepted', 'result_pending')
      and (
        (challenger_id = v_player_id and opponent_id = p_opponent_id)
        or (challenger_id = p_opponent_id and opponent_id = v_player_id)
      )
  ) then
    raise exception 'ACTIVE_CHALLENGE_EXISTS';
  end if;

  insert into public.rating_matches(challenger_id, opponent_id)
  values (v_player_id, p_opponent_id)
  returning * into v_match;
  return v_match;
end;
$$;

create or replace function public.respond_rating_challenge(
  p_match_id uuid,
  p_accept boolean
)
returns public.rating_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid := public.current_player_id();
  v_match public.rating_matches;
begin
  update public.rating_matches
  set status = case when p_accept then 'accepted' else 'declined' end,
      accepted_at = case when p_accept then now() else null end,
      updated_at = now()
  where id = p_match_id
    and opponent_id = v_player_id
    and status = 'pending'
  returning * into v_match;

  if v_match.id is null then raise exception 'CHALLENGE_NOT_AVAILABLE'; end if;
  return v_match;
end;
$$;

create or replace function public.cancel_rating_challenge(p_match_id uuid)
returns public.rating_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid := public.current_player_id();
  v_match public.rating_matches;
begin
  update public.rating_matches
  set status = 'cancelled', updated_at = now()
  where id = p_match_id
    and status in ('pending', 'accepted')
    and (
      challenger_id = v_player_id
      or (opponent_id = v_player_id and status = 'accepted')
    )
  returning * into v_match;

  if v_match.id is null then raise exception 'CHALLENGE_NOT_CANCELLABLE'; end if;
  return v_match;
end;
$$;

create or replace function public.submit_rating_match_result(
  p_match_id uuid,
  p_player1_set1 integer,
  p_player2_set1 integer,
  p_player1_set2 integer default null,
  p_player2_set2 integer default null,
  p_player1_set3 integer default null,
  p_player2_set3 integer default null,
  p_played_at date default current_date
)
returns public.rating_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid := public.current_player_id();
  v_match public.rating_matches;
  v_player1_wins integer := 0;
  v_player2_wins integer := 0;
begin
  select * into v_match
  from public.rating_matches
  where id = p_match_id
    and status = 'accepted'
    and v_player_id in (challenger_id, opponent_id)
  for update;

  if v_match.id is null then raise exception 'MATCH_NOT_READY'; end if;
  if p_player1_set1 is null or p_player2_set1 is null
     or p_player1_set1 < 0 or p_player2_set1 < 0
     or p_player1_set1 = p_player2_set1 then
    raise exception 'INVALID_FIRST_SET';
  end if;
  if (p_player1_set2 is null) <> (p_player2_set2 is null)
     or (p_player1_set3 is null) <> (p_player2_set3 is null) then
    raise exception 'INCOMPLETE_SET';
  end if;
  if (p_player1_set2 is not null and (p_player1_set2 < 0 or p_player2_set2 < 0 or p_player1_set2 = p_player2_set2))
     or (p_player1_set3 is not null and (p_player1_set3 < 0 or p_player2_set3 < 0 or p_player1_set3 = p_player2_set3)) then
    raise exception 'INVALID_SET_SCORE';
  end if;

  v_player1_wins := (case when p_player1_set1 > p_player2_set1 then 1 else 0 end)
    + (case when p_player1_set2 is not null and p_player1_set2 > p_player2_set2 then 1 else 0 end)
    + (case when p_player1_set3 is not null and p_player1_set3 > p_player2_set3 then 1 else 0 end);
  v_player2_wins := (case when p_player2_set1 > p_player1_set1 then 1 else 0 end)
    + (case when p_player2_set2 is not null and p_player2_set2 > p_player1_set2 then 1 else 0 end)
    + (case when p_player2_set3 is not null and p_player2_set3 > p_player1_set3 then 1 else 0 end);

  if v_player1_wins = v_player2_wins then raise exception 'MATCH_HAS_NO_WINNER'; end if;

  update public.rating_matches
  set status = 'result_pending',
      submitted_by_player_id = v_player_id,
      winner_id = case when v_player1_wins > v_player2_wins then challenger_id else opponent_id end,
      player1_set1 = p_player1_set1, player2_set1 = p_player2_set1,
      player1_set2 = p_player1_set2, player2_set2 = p_player2_set2,
      player1_set3 = p_player1_set3, player2_set3 = p_player2_set3,
      played_at = coalesce(p_played_at, current_date),
      result_submitted_at = now(),
      updated_at = now()
  where id = p_match_id
  returning * into v_match;
  return v_match;
end;
$$;

create or replace function public.confirm_rating_match_result(
  p_match_id uuid,
  p_approve boolean
)
returns public.rating_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid := public.current_player_id();
  v_match public.rating_matches;
  v_rating1 numeric;
  v_rating2 numeric;
  v_expected1 numeric;
  v_multiplier numeric;
  v_delta1 numeric;
  v_games1 integer;
  v_games2 integer;
begin
  select * into v_match
  from public.rating_matches
  where id = p_match_id
    and status = 'result_pending'
    and v_player_id in (challenger_id, opponent_id)
    and submitted_by_player_id <> v_player_id
  for update;

  if v_match.id is null then raise exception 'RESULT_NOT_CONFIRMABLE'; end if;

  if not p_approve then
    update public.rating_matches
    set status = 'accepted', submitted_by_player_id = null, winner_id = null,
        player1_set1 = null, player2_set1 = null,
        player1_set2 = null, player2_set2 = null,
        player1_set3 = null, player2_set3 = null,
        played_at = null, result_submitted_at = null, updated_at = now()
    where id = p_match_id
    returning * into v_match;
    return v_match;
  end if;

  select coalesce(rating, 3.0) into v_rating1 from public.players where id = v_match.challenger_id;
  select coalesce(rating, 3.0) into v_rating2 from public.players where id = v_match.opponent_id;
  v_games1 := coalesce(v_match.player1_set1, 0) + coalesce(v_match.player1_set2, 0) + coalesce(v_match.player1_set3, 0);
  v_games2 := coalesce(v_match.player2_set1, 0) + coalesce(v_match.player2_set2, 0) + coalesce(v_match.player2_set3, 0);
  v_multiplier := 1 + least(0.5, abs(v_games1 - v_games2)::numeric / greatest(1, v_games1 + v_games2));
  v_expected1 := 1 / (1 + power(10::numeric, v_rating2 - v_rating1));
  v_delta1 := round((0.05 * ((case when v_match.winner_id = v_match.challenger_id then 1 else 0 end) - v_expected1) * v_multiplier)::numeric, 3);

  update public.rating_matches
  set status = 'confirmed', confirmed_at = now(), updated_at = now()
  where id = p_match_id
  returning * into v_match;

  insert into public.player_rating_history(
    player_id, opponent_id, source_type, source_match_id, event_date,
    rating_before, rating_after, rating_change, score_multiplier, result
  ) values
  (
    v_match.challenger_id, v_match.opponent_id, 'rating_match', v_match.id,
    v_match.played_at, v_rating1, v_rating1 + v_delta1, v_delta1,
    v_multiplier, case when v_match.winner_id = v_match.challenger_id then 'win' else 'loss' end
  ),
  (
    v_match.opponent_id, v_match.challenger_id, 'rating_match', v_match.id,
    v_match.played_at, v_rating2, v_rating2 - v_delta1, -v_delta1,
    v_multiplier, case when v_match.winner_id = v_match.opponent_id then 'win' else 'loss' end
  );

  update public.players p
  set rating = greatest(1, least(7, coalesce(p.rating_base, 3.0) + coalesce((
    select sum(x.rating_change)
    from (
      select h.rating_change
      from public.player_rating_history h
      where h.player_id = p.id
      order by h.event_date desc, h.created_at desc
      limit 30
    ) x
  ), 0)))
  where p.id in (v_match.challenger_id, v_match.opponent_id);

  return v_match;
end;
$$;

revoke all on function public.current_player_id() from public;
revoke all on function public.create_rating_challenge(uuid) from public;
revoke all on function public.respond_rating_challenge(uuid, boolean) from public;
revoke all on function public.cancel_rating_challenge(uuid) from public;
revoke all on function public.submit_rating_match_result(uuid, integer, integer, integer, integer, integer, integer, date) from public;
revoke all on function public.confirm_rating_match_result(uuid, boolean) from public;
grant execute on function public.current_player_id() to authenticated;
grant execute on function public.create_rating_challenge(uuid) to authenticated;
grant execute on function public.respond_rating_challenge(uuid, boolean) to authenticated;
grant execute on function public.cancel_rating_challenge(uuid) to authenticated;
grant execute on function public.submit_rating_match_result(uuid, integer, integer, integer, integer, integer, integer, date) to authenticated;
grant execute on function public.confirm_rating_match_result(uuid, boolean) to authenticated;
