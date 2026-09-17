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
