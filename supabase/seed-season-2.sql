-- Approved ITL season 2 rosters, 18 September 2026.
-- Memberships are fixed; future rating changes do not reassign players.
-- Oleksii is in Futures A; Bruno and Tatiana in Futures B.
-- Registration records and all season 1 results remain untouched.
BEGIN;
LOCK TABLE public.league_seasons, public.league_players IN SHARE ROW EXCLUSIVE MODE;
DO $formation$
declare
  plan jsonb := '[{"title":"ITL Masters — Season 2","slug":"oleksandr-nesterov"},{"title":"ITL Masters — Season 2","slug":"ruslan-danyleiko"},{"title":"ITL Masters — Season 2","slug":"pasha-rybalskyi"},{"title":"ITL Masters — Season 2","slug":"oleksandr-ivanenko"},{"title":"ITL Masters — Season 2","slug":"mykhailo-odarchenko"},{"title":"ITL Masters — Season 2","slug":"вадим-касіч"},{"title":"ITL Masters — Season 2","slug":"dmytro-khmel"},{"title":"ITL Masters — Season 2","slug":"olia-aleksieieva"},{"title":"ITL Masters — Season 2","slug":"sasha-rudnytskyi"},{"title":"ITL Masters — Season 2","slug":"vitalii-zavadskyi"},{"title":"ITL Challenger — Season 2","slug":"mykyta-svoiehlazov"},{"title":"ITL Challenger — Season 2","slug":"aryna-solodenko"},{"title":"ITL Challenger — Season 2","slug":"anton-rohov"},{"title":"ITL Challenger — Season 2","slug":"павло-кураченко"},{"title":"ITL Challenger — Season 2","slug":"андрій-король"},{"title":"ITL Challenger — Season 2","slug":"ivan-viunkovskyi"},{"title":"ITL Challenger — Season 2","slug":"артем-прізвище"},{"title":"ITL Challenger — Season 2","slug":"анатолій-бегеньов"},{"title":"ITL Challenger — Season 2","slug":"konstantyn-mishyn"},{"title":"ITL Challenger — Season 2","slug":"ihor-lapatiiev"},{"title":"ITL Futures A — Season 2","slug":"svitlana-muzyka"},{"title":"ITL Futures A — Season 2","slug":"oleksandr-kavylyn"},{"title":"ITL Futures A — Season 2","slug":"andrii-avramenko"},{"title":"ITL Futures A — Season 2","slug":"vova-khasinevych"},{"title":"ITL Futures A — Season 2","slug":"влад-прокопенко"},{"title":"ITL Futures A — Season 2","slug":"поліна-жулаєва"},{"title":"ITL Futures A — Season 2","slug":"микола-прізвище"},{"title":"ITL Futures A — Season 2","slug":"олег"},{"title":"ITL Futures A — Season 2","slug":"саша-прізвище"},{"title":"ITL Futures B — Season 2","slug":"дмитро-горкун"},{"title":"ITL Futures B — Season 2","slug":"максим-бульбах"},{"title":"ITL Futures B — Season 2","slug":"olia-kulishenko"},{"title":"ITL Futures B — Season 2","slug":"микита-старук"},{"title":"ITL Futures B — Season 2","slug":"ілля-господарчук"},{"title":"ITL Futures B — Season 2","slug":"ярослав-цвілодуб"},{"title":"ITL Futures B — Season 2","slug":"вова-пастернак"},{"title":"ITL Futures B — Season 2","slug":"бруно"},{"title":"ITL Futures B — Season 2","slug":"tatiana-liubeshkina"},{"title":"ITL Ladies — Season 2","slug":"імя-прізвище"},{"title":"ITL Ladies — Season 2","slug":"оля-басманова"},{"title":"ITL Ladies — Season 2","slug":"діана-андрійович"},{"title":"ITL Ladies — Season 2","slug":"лариса-авраменко"},{"title":"ITL Ladies — Season 2","slug":"liudmyla-brodetska"},{"title":"ITL Ladies — Season 2","slug":"svitlana-muzyka"},{"title":"ITL Ladies — Season 2","slug":"olia-kulishenko"}]'::jsonb;
  old_seasons jsonb;
  old_memberships jsonb;
  old_matches jsonb;
  old_registrations jsonb;
  old_ratings jsonb;
begin
  select jsonb_agg(to_jsonb(s) order by id) into old_seasons from public.league_seasons s where title not like '%— Season 2';
  select jsonb_agg(to_jsonb(p) order by p.id) into old_memberships from public.league_players p
    join public.league_seasons s on s.id=p.season_id where s.title not like '%— Season 2';
  select jsonb_agg(to_jsonb(m) order by id) into old_matches from public.league_matches m;
  select jsonb_agg(to_jsonb(r) order by id) into old_registrations from public.itl_season_2_registrations r;
  select jsonb_agg(jsonb_build_object('id',id,'rating',rating) order by id) into old_ratings from public.players;

  if exists (
    select 1 from jsonb_to_recordset(plan) as desired(title text,slug text)
    left join public.players p on p.slug=desired.slug
    left join public.itl_season_2_registrations r on r.player_id=p.id
    where p.id is null or r.id is null
  ) then raise exception 'A planned player is missing or no longer registered'; end if;

  insert into public.league_seasons(title,description,start_date,end_date,is_active)
  select distinct desired.title,
    'Другий сезон Ірпінської тенісної ліги. Склад закріплено організатором. Формат: кожен грає з кожним. Перемога — 2 бали, поразка — 1 бал.',
    date '2026-09-21',date '2026-12-28',true
  from jsonb_to_recordset(plan) as desired(title text,slug text)
  where not exists(select 1 from public.league_seasons s where s.title=desired.title);

  if (select count(*) from public.league_seasons where title in
    (select distinct title from jsonb_to_recordset(plan) as d(title text,slug text))) <> 5
  then raise exception 'Expected exactly five unique season 2 leagues'; end if;

  insert into public.league_players(season_id,player_id)
  select s.id,p.id from jsonb_to_recordset(plan) as desired(title text,slug text)
  join public.league_seasons s on s.title=desired.title
  join public.players p on p.slug=desired.slug
  on conflict(season_id,player_id) do nothing;

  if exists (
    select s.title,p.slug from public.league_players lp
    join public.league_seasons s on s.id=lp.season_id
    join public.players p on p.id=lp.player_id
    where s.title in (select distinct title from jsonb_to_recordset(plan) as d(title text,slug text))
    except select title,slug from jsonb_to_recordset(plan) as d(title text,slug text)
  ) then raise exception 'Unexpected member in season 2'; end if;

  if (select count(*) from public.league_players lp join public.league_seasons s on s.id=lp.season_id
      where s.title in(select distinct title from jsonb_to_recordset(plan) as d(title text,slug text))) <> 45
  then raise exception 'Expected 45 memberships for 43 people'; end if;

  if exists (
    select 1 from (values
      ('ITL Masters — Season 2',10),('ITL Challenger — Season 2',10),
      ('ITL Futures A — Season 2',9),('ITL Futures B — Season 2',9),('ITL Ladies — Season 2',7)
    ) expected(title,n)
    where (select count(*) from public.league_players lp join public.league_seasons s on s.id=lp.season_id where s.title=expected.title) <> expected.n
  ) then raise exception 'League sizes differ from approved 10/10/9/9/7'; end if;

  if old_seasons is distinct from (select jsonb_agg(to_jsonb(s) order by id) from public.league_seasons s where title not like '%— Season 2')
    or old_memberships is distinct from (select jsonb_agg(to_jsonb(p) order by p.id) from public.league_players p join public.league_seasons s on s.id=p.season_id where s.title not like '%— Season 2')
    or old_matches is distinct from (select jsonb_agg(to_jsonb(m) order by id) from public.league_matches m)
    or old_registrations is distinct from (select jsonb_agg(to_jsonb(r) order by id) from public.itl_season_2_registrations r)
    or old_ratings is distinct from (select jsonb_agg(jsonb_build_object('id',id,'rating',rating) order by id) from public.players)
  then raise exception 'Existing history, registrations or ratings were modified'; end if;
end;
$formation$;
COMMIT;
