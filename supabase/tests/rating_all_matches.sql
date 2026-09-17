-- Integration test: all changes, including the temporary match status, are rolled back.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('irpintennis_rating_recalculation'));
DO $test$
declare
  candidate public.rating_matches;
  confirmer uuid;
  original_count bigint;
  denied boolean := false;
  result public.rating_matches;
begin
  select m.* into candidate
  from public.rating_matches m
  join public.players p on p.id = case when m.submitted_by_player_id=m.challenger_id then m.opponent_id else m.challenger_id end
  where m.status='confirmed' and m.submitted_by_player_id in (m.challenger_id,m.opponent_id)
    and p.user_id is not null
  order by m.id limit 1;
  if candidate.id is null then raise exception 'No testable confirmed match'; end if;
  select user_id into confirmer from public.players
  where id=case when candidate.submitted_by_player_id=candidate.challenger_id then candidate.opponent_id else candidate.challenger_id end;
  select count(*) into original_count from public.player_rating_history;
  update public.rating_matches set status='result_pending' where id=candidate.id;
  perform set_config('request.jwt.claim.sub','',true);
  perform set_config('request.jwt.claims','{}',true);
  begin
    perform public.confirm_rating_match_result(candidate.id,true);
  exception when others then
    if sqlerrm <> 'RESULT_NOT_CONFIRMABLE' then raise; end if;
    denied := true;
  end;
  if not denied then raise exception 'Unauthenticated confirmation succeeded'; end if;
  perform set_config('request.jwt.claim.sub',confirmer::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',confirmer,'role','authenticated')::text,true);
  result := public.confirm_rating_match_result(candidate.id,true);
  if result.status <> 'confirmed' then raise exception 'Confirmation failed'; end if;
  if (select count(*) from public.player_rating_history) <> original_count then raise exception 'Duplicate or missing history'; end if;
  if (select count(*) from public.player_rating_history where source_type='rating_match' and source_match_id=candidate.id) <> 2 then raise exception 'Expected two history rows per match'; end if;
  denied := false;
  begin
    perform public.confirm_rating_match_result(candidate.id,true);
  exception when others then
    if sqlerrm <> 'RESULT_NOT_CONFIRMABLE' then raise; end if;
    denied := true;
  end;
  if not denied then raise exception 'Duplicate confirmation succeeded'; end if;
  update public.rating_matches set status='result_pending' where id=candidate.id;
  result := public.confirm_rating_match_result(candidate.id,false);
  if result.status <> 'accepted' or result.winner_id is not null then raise exception 'Rejection failed'; end if;
  if exists(select 1 from public.player_rating_history where source_type='rating_match' and source_match_id=candidate.id) then raise exception 'Rejected match affected rating'; end if;
end;
$test$;
ROLLBACK;
