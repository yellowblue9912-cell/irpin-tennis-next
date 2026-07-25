-- Public profiles show age calculated by the website, but never expose addresses.
create or replace view public.public_player_contacts
with (security_invoker = false)
as
select
  player_id,
  case
    when phone_public or auth.role() = 'authenticated' then phone
    else null
  end as phone,
  birth_date,
  phone_public
from public.player_private_profiles;

grant select on public.public_player_contacts to anon, authenticated;
