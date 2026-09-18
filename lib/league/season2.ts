import "server-only";
import { createClient } from "@/lib/supabase/server";
import { season2Leagues } from "./configuration";

export async function getSeason2Groups() {
  const supabase = await createClient();
  const { data: seasons, error: seasonsError } = await supabase
    .from("league_seasons")
    .select("id, title, is_active")
    .in("title", season2Leagues.map((league) => league.seasonTitle));
  if (seasonsError) throw new Error("Не вдалося завантажити ліги другого сезону");
  if (!seasons?.length) return [];

  const { data: memberships, error: membershipsError } = await supabase
    .from("league_players").select("season_id, player_id")
    .in("season_id", seasons.map((season) => season.id));
  if (membershipsError) throw new Error("Не вдалося завантажити склади ліг");
  const playerIds = [...new Set((memberships ?? []).map((row) => row.player_id))];
  const { data: players, error: playersError } = playerIds.length
    ? await supabase.from("players").select("id, name, slug, rating").in("id", playerIds)
    : { data: [], error: null };
  if (playersError) throw new Error("Не вдалося завантажити гравців ліг");
  const playerMap = new Map((players ?? []).map((player) => [player.id, player]));

  return season2Leagues.flatMap((configuration) => {
    const season = seasons.find((item) => item.title === configuration.seasonTitle);
    if (!season) return [];
    const participants = (memberships ?? []).filter((row) => row.season_id === season.id)
      .map((row) => playerMap.get(row.player_id))
      .filter((player): player is NonNullable<typeof player> => Boolean(player))
      .map((player) => ({ ...player, rating: Number(player.rating ?? 0) }))
      .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name, "uk-UA"));
    return [{ ...configuration, id: season.id, isActive: season.is_active, participants }];
  });
}
