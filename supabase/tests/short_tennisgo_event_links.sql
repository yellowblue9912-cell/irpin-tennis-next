begin;
create temp table link_fixtures as
select 'match'::text kind,id from public.app_scheduled_matches where moderation_deleted_at is null limit 1;
insert into link_fixtures
select 'tournament',id from public.app_tournaments where moderation_deleted_at is null and status in ('registration','active','completed') limit 1;
grant select on link_fixtures to anon;
set local role anon;
do $$ declare r record; c text; begin
  for r in select * from link_fixtures loop
    c:=public.get_event_share_code(r.kind,r.id);
    if c is null or c !~ '^[a-f0-9]{8}$' then raise exception 'Expected short code'; end if;
    if public.get_event_share_code(r.kind,r.id) is distinct from c then raise exception 'Alias changed'; end if;
    if public.resolve_event_share_code(r.kind,c) is distinct from r.id then raise exception 'Wrong event'; end if;
    if public.resolve_event_share_code(r.kind,upper(c)) is distinct from r.id then raise exception 'Case mismatch'; end if;
    if public.resolve_event_share_code(case r.kind when 'match' then 'tournament' else 'match' end,c) is not null then raise exception 'Wrong kind resolved'; end if;
  end loop;
  if public.get_event_share_code('match','00000000-0000-0000-0000-000000000000') is not null then raise exception 'Missing event allocated'; end if;
  if public.resolve_event_share_code('match','../oops') is not null then raise exception 'Invalid input resolved'; end if;
  if has_table_privilege('anon','app_invitation_private.short_links','select') then raise exception 'Private table exposed'; end if;
end $$;
reset role;
insert into app_invitation_private.short_links(kind,event_id,code) values('match','00000000-0000-0000-0000-000000000000','deadbeef');
set local role anon;
do $$ begin
  if public.resolve_event_share_code('match','deadbeef') is not null then raise exception 'Stale/deleted event exposed'; end if;
end $$;
rollback;
