do $$
declare
  challenger_season uuid := '16fa37e0-3102-4345-8691-a1ff5b4e01be';
  hunin uuid := 'e5715f77-059c-42e2-942c-a59b5ad0986e';
  mishyn uuid := '066177ba-eda7-4256-823f-1f30caedd1bb';
begin
  if not exists (
    select 1 from public.league_matches
    where match_key = 'challenger-s1-viacheslav-hunin-vs-konstantyn-mishyn'
  ) then
    insert into public.league_matches (
      season_id, match_key, player1_id, player2_id, winner_id,
      player1_set1, player2_set1, player1_set2, player2_set2,
      player1_set3, player2_set3, played_at
    ) values (
      challenger_season,
      'challenger-s1-viacheslav-hunin-vs-konstantyn-mishyn',
      hunin, mishyn, hunin,
      6, 1, 6, 1, null, null, '2026-07-06'
    );

    update public.league_players
    set matches_played = matches_played + 1,
        wins = wins + 1,
        sets_difference = sets_difference + 2,
        games_difference = games_difference + 10,
        points = points + 2
    where season_id = challenger_season and player_id = hunin;

    update public.league_players
    set matches_played = matches_played + 1,
        losses = losses + 1,
        sets_difference = sets_difference - 2,
        games_difference = games_difference - 10,
        points = points + 1
    where season_id = challenger_season and player_id = mishyn;
  end if;
end $$;
