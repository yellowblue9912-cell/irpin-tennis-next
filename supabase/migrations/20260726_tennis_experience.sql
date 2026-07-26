-- Adds a public tennis-experience value managed by the player.
begin;

alter table public.player_private_profiles
  add column if not exists tennis_experience_years smallint;

alter table public.player_private_profiles
  drop constraint if exists player_private_profiles_tennis_experience_years_check;

alter table public.player_private_profiles
  add constraint player_private_profiles_tennis_experience_years_check
  check (
    tennis_experience_years is null
    or tennis_experience_years between 1 and 50
  );

drop view if exists public.public_player_contacts;

create view public.public_player_contacts
with (security_invoker = false)
as
select
  player_id,
  case
    when phone_public or auth.role() = 'authenticated' then phone
    else null
  end as phone,
  birth_date,
  tennis_experience_years,
  phone_public
from public.player_private_profiles;

grant select on public.public_player_contacts to anon, authenticated;

commit;
