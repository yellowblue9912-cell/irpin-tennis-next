-- Phone privacy:
-- phone_public = true  -> visible to everyone
-- phone_public = false -> visible only to authenticated users
create or replace view public.public_player_contacts
with (security_invoker = false)
as
select
  player_id,
  case
    when phone_public or auth.role() = 'authenticated' then phone
    else null
  end as phone,
  case when address_public then address else null end as address,
  phone_public,
  address_public
from public.player_private_profiles;

grant select on public.public_player_contacts to anon, authenticated;
