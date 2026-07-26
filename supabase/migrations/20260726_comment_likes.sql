create table if not exists public.player_comment_likes (
  comment_id uuid not null references public.player_comments(id) on delete cascade,
  device_hash text not null check (device_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  primary key (comment_id, device_hash)
);

create index if not exists player_comment_likes_comment_idx
  on public.player_comment_likes (comment_id);

alter table public.player_comment_likes enable row level security;

revoke all on public.player_comment_likes from anon, authenticated;

create or replace function public.get_player_comment_likes(
  p_target_player_id uuid,
  p_device_hash text
)
returns table (
  comment_id uuid,
  like_count bigint,
  liked boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    comments.id as comment_id,
    count(likes.comment_id) as like_count,
    bool_or(likes.device_hash = p_device_hash) as liked
  from public.player_comments as comments
  left join public.player_comment_likes as likes
    on likes.comment_id = comments.id
  where comments.target_player_id = p_target_player_id
  group by comments.id;
$$;

create or replace function public.toggle_player_comment_like(
  p_comment_id uuid,
  p_device_hash text
)
returns table (
  liked boolean,
  like_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  is_liked boolean;
begin
  if p_device_hash is null or p_device_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid device identifier';
  end if;

  if not exists (
    select 1
    from public.player_comments
    where id = p_comment_id
  ) then
    raise exception 'Comment not found';
  end if;

  delete from public.player_comment_likes as likes
  where likes.comment_id = p_comment_id
    and likes.device_hash = p_device_hash;

  if found then
    is_liked := false;
  else
    insert into public.player_comment_likes (comment_id, device_hash)
    values (p_comment_id, p_device_hash)
    on conflict do nothing;
    is_liked := true;
  end if;

  return query
  select
    is_liked,
    count(*)::bigint
  from public.player_comment_likes as likes
  where likes.comment_id = p_comment_id;
end;
$$;

revoke all on function public.get_player_comment_likes(uuid, text) from public;
revoke all on function public.toggle_player_comment_like(uuid, text) from public;

grant execute on function public.get_player_comment_likes(uuid, text)
  to anon, authenticated;
grant execute on function public.toggle_player_comment_like(uuid, text)
  to anon, authenticated;
