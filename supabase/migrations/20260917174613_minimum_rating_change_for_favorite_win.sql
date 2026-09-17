CREATE OR REPLACE FUNCTION public.recalculate_player_ratings()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  match_record record;
  player1_rating numeric;
  player2_rating numeric;
  player1_expected numeric;
  player1_change numeric;
  player2_change numeric;
  player1_after numeric;
  player2_after numeric;
  score_multiplier numeric;
  player1_games integer;
  player2_games integer;
  event_index integer := 0;
  history_event_date timestamptz;
begin
  -- Prevent overlapping recalculations from deleting or replacing each
  -- other's history when two match updates arrive at the same time.
  perform pg_advisory_xact_lock(hashtext('irpintennis_rating_recalculation'));

  create temporary table if not exists rating_recalculation_state (
    player_id uuid primary key,
    base_rating numeric not null,
    current_rating numeric not null
  ) on commit drop;
  create temporary table if not exists rating_recalculation_changes (
    sequence_id bigserial primary key,
    player_id uuid not null,
    rating_change numeric not null
  ) on commit drop;

  truncate table rating_recalculation_state;
  truncate table rating_recalculation_changes restart identity;

  insert into rating_recalculation_state (player_id, base_rating, current_rating)
  select id, coalesce(rating_base, 3.0), coalesce(rating_base, 3.0)
  from public.players;

  delete from public.player_rating_history where true;

  for match_record in
    with rating_events as (
      select
        'tournament'::text as source_type,
        m.id as source_match_id,
        m.player1_id,
        m.player2_id,
        m.winner_id,
        coalesce(t.tournament_date::timestamptz, m.created_at) as event_date,
        0 as type_order,
        coalesce(m.round_number, 0) as within_event_order,
        m.created_at as stable_date,
        m.player1_set1, m.player2_set1,
        m.player1_set2, m.player2_set2,
        m.player1_set3, m.player2_set3,
        m.notes
      from public.matches m
      join public.tournaments t on t.id = m.tournament_id
      where m.status = 'finished'
        and m.player1_id is not null
        and m.player2_id is not null
        and m.winner_id is not null

      union all

      select
        'league'::text,
        lm.id,
        lm.player1_id,
        lm.player2_id,
        lm.winner_id,
        coalesce(lm.played_at::timestamptz, lm.created_at),
        1,
        0,
        lm.created_at,
        lm.player1_set1, lm.player2_set1,
        lm.player1_set2, lm.player2_set2,
        lm.player1_set3, lm.player2_set3,
        lm.notes
      from public.league_matches lm
      where lm.player1_id is not null
        and lm.player2_id is not null
        and lm.winner_id is not null

      union all

      select
        'rating_match'::text,
        rm.id,
        rm.challenger_id,
        rm.opponent_id,
        rm.winner_id,
        coalesce(rm.played_at::timestamptz, rm.confirmed_at, rm.created_at),
        2,
        0,
        coalesce(rm.confirmed_at, rm.created_at),
        rm.player1_set1, rm.player2_set1,
        rm.player1_set2, rm.player2_set2,
        rm.player1_set3, rm.player2_set3,
        null::text
      from public.rating_matches rm
      where rm.status = 'confirmed'
        and rm.challenger_id is not null
        and rm.opponent_id is not null
        and rm.winner_id is not null
    )
    select *
    from rating_events
    order by event_date, type_order, within_event_order, stable_date, source_match_id
  loop
    select current_rating into player1_rating
    from rating_recalculation_state where player_id = match_record.player1_id;
    select current_rating into player2_rating
    from rating_recalculation_state where player_id = match_record.player2_id;
    if player1_rating is null or player2_rating is null then continue; end if;

    -- A third-set match tiebreak is not counted as ordinary games.
    if match_record.player1_set3 is not null
      and match_record.player2_set3 is not null
      and (
        lower(coalesce(match_record.notes, '')) like '%тайбрейк%'
        or lower(coalesce(match_record.notes, '')) like '%tiebreak%'
        or lower(coalesce(match_record.notes, '')) like '%tie-break%'
        or greatest(match_record.player1_set3, match_record.player2_set3) > 7
        or (
          greatest(match_record.player1_set3, match_record.player2_set3) = 7
          and least(match_record.player1_set3, match_record.player2_set3) < 5
        )
      )
    then
      player1_games := coalesce(match_record.player1_set1, 0) + coalesce(match_record.player1_set2, 0);
      player2_games := coalesce(match_record.player2_set1, 0) + coalesce(match_record.player2_set2, 0);
    else
      player1_games := coalesce(match_record.player1_set1, 0) + coalesce(match_record.player1_set2, 0) + coalesce(match_record.player1_set3, 0);
      player2_games := coalesce(match_record.player2_set1, 0) + coalesce(match_record.player2_set2, 0) + coalesce(match_record.player2_set3, 0);
    end if;

    score_multiplier := round((1 + least(
      0.5,
      abs(player1_games - player2_games)::numeric / greatest(1, player1_games + player2_games)
    ))::numeric, 3);
    player1_expected := 1 / (1 + power(10::numeric, player2_rating - player1_rating));
    player1_change := round((0.05 * (
      (case when match_record.winner_id = match_record.player1_id then 1 else 0 end)
      - player1_expected
    ) * score_multiplier)::numeric, 3);
    -- Strictly more than 0.50 before the match; an upset keeps the normal formula.
    if abs(player1_rating - player2_rating) > 0.50
      and (
        (player1_rating > player2_rating and match_record.winner_id = match_record.player1_id)
        or (player2_rating > player1_rating and match_record.winner_id = match_record.player2_id)
      )
    then
      player1_change := case when match_record.winner_id = match_record.player1_id
        then 0.010 else -0.010 end;
    end if;
    player2_change := -player1_change;

    insert into rating_recalculation_changes(player_id, rating_change)
    values (match_record.player1_id, player1_change),
           (match_record.player2_id, player2_change);

    select round(greatest(1, least(7, state.base_rating + coalesce((
      select sum(recent.rating_change)
      from (
        select change.rating_change
        from rating_recalculation_changes change
        where change.player_id = state.player_id
        order by change.sequence_id desc
      ) recent
    ), 0)))::numeric, 3)
    into player1_after
    from rating_recalculation_state state
    where state.player_id = match_record.player1_id;

    select round(greatest(1, least(7, state.base_rating + coalesce((
      select sum(recent.rating_change)
      from (
        select change.rating_change
        from rating_recalculation_changes change
        where change.player_id = state.player_id
        order by change.sequence_id desc
      ) recent
    ), 0)))::numeric, 3)
    into player2_after
    from rating_recalculation_state state
    where state.player_id = match_record.player2_id;

    event_index := event_index + 1;
    history_event_date := match_record.event_date + event_index * interval '1 millisecond';

    insert into public.player_rating_history (
      player_id, opponent_id, source_type, source_match_id, event_date,
      rating_before, rating_after, rating_change, score_multiplier, result
    ) values
      (
        match_record.player1_id, match_record.player2_id,
        match_record.source_type, match_record.source_match_id, history_event_date,
        round(player1_rating, 3), player1_after, player1_change, score_multiplier,
        case when match_record.winner_id = match_record.player1_id then 'win' else 'loss' end
      ),
      (
        match_record.player2_id, match_record.player1_id,
        match_record.source_type, match_record.source_match_id, history_event_date,
        round(player2_rating, 3), player2_after, player2_change, score_multiplier,
        case when match_record.winner_id = match_record.player2_id then 'win' else 'loss' end
      );

    update rating_recalculation_state set current_rating = player1_after
    where player_id = match_record.player1_id;
    update rating_recalculation_state set current_rating = player2_after
    where player_id = match_record.player2_id;
  end loop;

  update public.players player
  set rating = round(state.current_rating, 3),
      base_rating = state.base_rating,
      rating_updated_at = now()
  from rating_recalculation_state state
  where state.player_id = player.id;
end;
$function$;

DO $verify$
declare
  before_count bigint;
begin
  select count(*) into before_count from public.player_rating_history;
  perform public.recalculate_player_ratings();
  if (select count(*) from public.player_rating_history) <> before_count then
    raise exception 'Unexpected change to rating history count';
  end if;
  if exists (
    select 1
    from public.player_rating_history h
    join public.player_rating_history o
      on o.source_type=h.source_type and o.source_match_id=h.source_match_id
      and o.player_id=h.opponent_id
    where h.rating_change <> case
      when (h.rating_before-o.rating_before > 0.50 and h.result='win')
        or (o.rating_before-h.rating_before > 0.50 and h.result='loss')
      then case when h.result='win' then 0.010 else -0.010 end
      else round(0.05 * ((case when h.result='win' then 1 else 0 end)
        - 1/(1+power(10::numeric,o.rating_before-h.rating_before))) * h.score_multiplier,3)
      end
  ) then
    raise exception 'Rating gap formula validation failed';
  end if;
  if exists (
    select 1 from (
      select h.rating_after,
        round(greatest(1,least(7,coalesce(p.rating_base,3.0) +
          sum(h.rating_change) over (partition by h.player_id order by h.event_date,h.created_at,h.id rows unbounded preceding))),3) as expected
      from public.player_rating_history h join public.players p on p.id=h.player_id
    ) checked where rating_after <> expected
  ) then
    raise exception 'Cumulative all-match rating validation failed';
  end if;
end;
$verify$;

-- Tests the calculation block extracted from the deployed function; no data writes.
DO $outer$
declare calculation text;
begin
  select substring(pg_get_functiondef('public.recalculate_player_ratings()'::regprocedure)
    from '(?s)(    player1_expected :=.*?    player2_change := -player1_change;)')
  into calculation;
  if calculation is null then raise exception 'Calculation block not found'; end if;
  execute $prefix$
    DO $cases$
    declare
      c record;
      match_record record;
      player1_rating numeric;
      player2_rating numeric;
      player1_expected numeric;
      player1_change numeric;
      player2_change numeric;
      score_multiplier numeric;
      normal_delta numeric;
    begin
      for c in select * from (values
        (4.240,3.750,true,1.000,false),
        (4.250,3.750,true,1.500,false),
        (4.251,3.750,true,1.000,true),
        (4.251,3.750,true,1.500,true),
        (3.750,4.251,false,1.500,true),
        (4.500,3.000,true,1.000,true),
        (3.000,4.500,false,1.000,true),
        (4.251,3.750,false,1.500,false),
        (3.750,4.251,true,1.500,false),
        (3.000,3.000,true,1.500,false),
        (3.750,4.250,false,1.500,false)
      ) as examples(r1,r2,p1_wins,multiplier,minimal) loop
        player1_rating := c.r1; player2_rating := c.r2; score_multiplier := c.multiplier;
        select 1 as player1_id,2 as player2_id,case when c.p1_wins then 1 else 2 end as winner_id into match_record;
        normal_delta := round(0.05*((case when c.p1_wins then 1 else 0 end)
          -1/(1+power(10::numeric,c.r2-c.r1)))*score_multiplier,3);
  $prefix$ || calculation || $suffix$
        if player1_change <> (case when c.minimal
          then case when c.p1_wins then 0.010 else -0.010 end else normal_delta end)
        then raise exception 'Boundary case failed: %',row_to_json(c); end if;
        if player2_change <> -player1_change then raise exception 'Changes must balance'; end if;
      end loop;
    end;
    $cases$;
  $suffix$;
end;
$outer$;
