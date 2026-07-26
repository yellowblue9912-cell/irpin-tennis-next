import { createClient } from "../supabase/server";
import type { Player } from "../../types/player";
import { getPlayerName, getPlayerPhoto } from "./getPlayerPhoto";

export async function getPlayers(): Promise<Player[]> {
  const supabase = await createClient();

  const [
    { data, error },
    { data: ratingHistory, error: ratingHistoryError },
    { data: leaguePlayers, error: leaguePlayersError },
    { data: tournamentPlayers, error: tournamentPlayersError },
  ] = await Promise.all([
    supabase
      .from("players")
      .select(
        `
          id,
          name,
          slug,
          rating,
          photo_url,
          city,
          is_active,
          created_at,
          updated_at
        `
      )
      .order("rating", { ascending: false })
      .order("name", { ascending: true }),
    supabase.from("player_rating_history").select("player_id"),
    supabase.from("league_players").select("player_id"),
    supabase.from("tournament_players").select("player_id"),
  ]);

  if (error) {
    console.error("Get players error:", error);
    return [];
  }

  if (ratingHistoryError) {
    console.error("Get player rating history error:", ratingHistoryError);
  }

  if (leaguePlayersError) {
    console.error("Get league players error:", leaguePlayersError);
  }

  if (tournamentPlayersError) {
    console.error("Get tournament players error:", tournamentPlayersError);
  }

  const eligiblePlayerIds = new Set<string>();

  for (const row of ratingHistory ?? []) {
    eligiblePlayerIds.add(row.player_id);
  }

  for (const row of leaguePlayers ?? []) {
    eligiblePlayerIds.add(row.player_id);
  }

  for (const row of tournamentPlayers ?? []) {
    eligiblePlayerIds.add(row.player_id);
  }

  return ((data ?? []) as Player[])
    .filter((player) => eligiblePlayerIds.has(player.id))
    .map((player) => ({
      ...player,
      name: getPlayerName(player.slug, player.name),
      photo_url: getPlayerPhoto(player.slug, player.photo_url),
    }));
}
