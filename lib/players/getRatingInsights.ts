import { cache } from "react";
import { createClient } from "../supabase/server";
import { getPlayers } from "./getPlayers";
import { calculateRatingInsights, type InsightsHistory, type InsightsPlayer } from "./ratingInsights";

const loadRatingHistory = cache(async () => {
  const supabase = await createClient();
  const rows: InsightsHistory[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.from("player_rating_history")
      .select("player_id,opponent_id,source_type,source_match_id,event_date,rating_before,rating_after")
      .order("event_date").order("id")
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    rows.push(...(data ?? []) as InsightsHistory[]);
    if (!data || data.length < pageSize) return rows;
  }
});

export async function getRatingInsights(playerId: string) {
  try {
    const supabase = await createClient();
    const [history, visiblePlayers, { data: roster, error }] = await Promise.all([
      loadRatingHistory(),
      getPlayers(),
      supabase.from("players").select("id,rating,rating_base,is_active")
        .order("name").order("id"),
    ]);
    if (error) throw error;
    // Match the website's public ranking eligibility, including inactive opponents
    // in match averages but not in the active ranking position.
    const eligible = new Set(visiblePlayers.map((player) => player.id));
    for (const row of history) eligible.add(row.player_id);
    return calculateRatingInsights(playerId,
      ((roster ?? []) as InsightsPlayer[]).filter((player) => eligible.has(player.id)), history);
  } catch (error) {
    console.error("Player rating insights loading error:", error);
    return null;
  }
}
