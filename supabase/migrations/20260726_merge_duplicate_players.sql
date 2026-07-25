-- Merge duplicate player cards without losing tournament or league history.
-- Keep:
--   Ігор Лапатієв       84a08f65-03fa-49a2-ad6f-4bbf5f9ecfc0
--   Олександр Кавилін   196d23c4-8dc6-454c-8cb5-a56968cb9b0a
do $$
declare
  pair record;
begin
  for pair in
    select *
    from (
      values
        (
          '84a08f65-03fa-49a2-ad6f-4bbf5f9ecfc0'::uuid,
          '5008cc13-6c5e-45ed-ae34-d89acf436a14'::uuid
        ),
        (
          '196d23c4-8dc6-454c-8cb5-a56968cb9b0a'::uuid,
          'ab909596-d285-404d-a148-a70f0dbd56bd'::uuid
        )
    ) as pairs(keep_id, duplicate_id)
  loop
    delete from public.tournament_players duplicate_row
    using public.tournament_players keep_row
    where duplicate_row.player_id = pair.duplicate_id
      and keep_row.player_id = pair.keep_id
      and keep_row.tournament_id = duplicate_row.tournament_id;

    update public.tournament_players
    set player_id = pair.keep_id
    where player_id = pair.duplicate_id;

    delete from public.tournament_placements duplicate_row
    using public.tournament_placements keep_row
    where duplicate_row.player_id = pair.duplicate_id
      and keep_row.player_id = pair.keep_id
      and keep_row.tournament_id = duplicate_row.tournament_id;

    update public.tournament_placements
    set player_id = pair.keep_id
    where player_id = pair.duplicate_id;

    delete from public.league_players duplicate_row
    using public.league_players keep_row
    where duplicate_row.player_id = pair.duplicate_id
      and keep_row.player_id = pair.keep_id
      and keep_row.season_id = duplicate_row.season_id;

    update public.league_players
    set player_id = pair.keep_id
    where player_id = pair.duplicate_id;

    update public.matches
    set winner_id = pair.keep_id
    where winner_id = pair.duplicate_id;

    update public.matches
    set player1_id = pair.keep_id
    where player1_id = pair.duplicate_id;

    update public.matches
    set player2_id = pair.keep_id
    where player2_id = pair.duplicate_id;

    delete from public.matches where player1_id = player2_id;

    update public.league_matches
    set winner_id = pair.keep_id
    where winner_id = pair.duplicate_id;

    update public.league_matches
    set player1_id = pair.keep_id
    where player1_id = pair.duplicate_id;

    update public.league_matches
    set player2_id = pair.keep_id
    where player2_id = pair.duplicate_id;

    delete from public.league_matches where player1_id = player2_id;

    delete from public.player_private_profiles duplicate_profile
    using public.player_private_profiles keep_profile
    where duplicate_profile.player_id = pair.duplicate_id
      and keep_profile.player_id = pair.keep_id;

    update public.player_private_profiles
    set player_id = pair.keep_id
    where player_id = pair.duplicate_id;

    delete from public.players where id = pair.duplicate_id;
  end loop;
end
$$;
