import { createClient } from "../supabase/server";
import type { RatingInsights } from "./ratingInsights";

// Public profiles receive aggregates, never another player's per-match changes.
export async function getRatingInsights(playerId: string): Promise<RatingInsights | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_player_rating_summary", { p_player_id: playerId });
  if (error) { console.error("Player rating summary loading error:", error); return null; }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    averageOpponentRating: row.average_opponent_rating == null ? null : Number(row.average_opponent_rating),
    opponentMatches: Number(row.opponent_matches ?? 0),
    highestRank: row.highest_rank == null ? null : Number(row.highest_rank),
  };
}
