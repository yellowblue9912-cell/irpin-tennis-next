do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(procedure.oid)
  into function_definition
  from pg_proc procedure
  join pg_namespace namespace on namespace.oid = procedure.pronamespace
  where namespace.nspname = 'public'
    and procedure.proname = 'recalculate_player_ratings'
  limit 1;

  if function_definition is null then
    raise exception 'Function public.recalculate_player_ratings was not found';
  end if;

  function_definition := replace(
    function_definition,
    'delete from public.player_rating_history;',
    'delete from public.player_rating_history where true;'
  );

  execute function_definition;
end
$$;
