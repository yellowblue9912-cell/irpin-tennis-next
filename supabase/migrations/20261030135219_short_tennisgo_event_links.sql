-- Persistent public invitation aliases. They are identifiers, never authorization.
create table app_invitation_private.short_links (
  kind text not null check (kind in ('match','tournament')),
  event_id uuid not null,
  code text not null unique check (code ~ '^[a-f0-9]{8}$'),
  primary key (kind,event_id)
);
alter table app_invitation_private.short_links enable row level security;
revoke all on app_invitation_private.short_links from public,anon,authenticated;

create function app_invitation_private.share_code(p_kind text,p_id uuid)
returns text language plpgsql security definer set search_path='' as $$
declare v_code text;
begin
  -- Only events already visible through the public invitation API can be shared.
  if app_invitation_private.public_event_invitation(p_kind,p_id) is null then return null; end if;
  select code into v_code from app_invitation_private.short_links where kind=p_kind and event_id=p_id;
  if v_code is not null then return v_code; end if;
  loop
    v_code := substr(replace(gen_random_uuid()::text,'-',''),1,8);
    begin
      insert into app_invitation_private.short_links(kind,event_id,code) values(p_kind,p_id,v_code)
      on conflict(kind,event_id) do update set event_id=excluded.event_id
      returning code into v_code;
      return v_code;
    exception when unique_violation then
      -- A collision never changes or reassigns an existing link.
    end;
  end loop;
end; $$;
revoke all on function app_invitation_private.share_code(text,uuid) from public;
grant execute on function app_invitation_private.share_code(text,uuid) to anon,authenticated;

create function app_invitation_private.resolve_code(p_kind text,p_code text)
returns uuid language sql stable security definer set search_path='' as $$
  select event_id from app_invitation_private.short_links
  where kind=p_kind and code=lower(p_code) and p_code ~* '^[a-f0-9]{8}$'
  and app_invitation_private.public_event_invitation(kind,event_id) is not null;
$$;
revoke all on function app_invitation_private.resolve_code(text,text) from public;
grant execute on function app_invitation_private.resolve_code(text,text) to anon,authenticated;

create function public.get_event_share_code(p_kind text,p_id uuid)
returns text language sql security invoker set search_path='' as $$
  select app_invitation_private.share_code(p_kind,p_id);
$$;
revoke all on function public.get_event_share_code(text,uuid) from public;
grant execute on function public.get_event_share_code(text,uuid) to anon,authenticated;
create function public.resolve_event_share_code(p_kind text,p_code text)
returns uuid language sql stable security invoker set search_path='' as $$
  select app_invitation_private.resolve_code(p_kind,p_code);
$$;
revoke all on function public.resolve_event_share_code(text,text) from public;
grant execute on function public.resolve_event_share_code(text,text) to anon,authenticated;
