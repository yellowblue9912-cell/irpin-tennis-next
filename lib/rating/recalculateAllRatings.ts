import { isThirdSetTiebreak } from "@/lib/matches/tiebreak";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type MatchType = "tournament" | "league" | "rating_match";
type ScoreRow = {
  id: string; player1_id: string; player2_id: string; winner_id: string;
  player1_set1: number | null; player2_set1: number | null;
  player1_set2: number | null; player2_set2: number | null;
  player1_set3: number | null; player2_set3: number | null;
  notes?: string | null;
};
type RatingEvent = ScoreRow & { type: MatchType; eventDate: string; sortKey: string };
type HistoryInsert = {
  player_id: string; opponent_id: string; source_type: MatchType; source_match_id: string;
  event_date: string; rating_before: number; rating_after: number; rating_change: number;
  score_multiplier: number; result: "win" | "loss";
};

const clamp = (value: number) => Math.max(1, Math.min(7, value));
const round3 = (value: number) => Math.round((value + Number.EPSILON) * 1000) / 1000;

export async function recalculateAllRatings() {
  const db = createAdminSupabaseClient();
  const [playersResult, tournamentsResult, matchesResult, leagueResult, ratingResult] = await Promise.all([
    db.from("players").select("id, rating_base"),
    db.from("tournaments").select("id, tournament_date"),
    db.from("matches").select("id, tournament_id, round_number, created_at, player1_id, player2_id, winner_id, player1_set1, player2_set1, player1_set2, player2_set2, player1_set3, player2_set3, notes").eq("status", "finished").range(0, 4999),
    db.from("league_matches").select("id, played_at, created_at, player1_id, player2_id, winner_id, player1_set1, player2_set1, player1_set2, player2_set2, player1_set3, player2_set3, notes").range(0, 4999),
    db.from("rating_matches").select("id, played_at, confirmed_at, created_at, challenger_id, opponent_id, winner_id, player1_set1, player2_set1, player1_set2, player2_set2, player1_set3, player2_set3").eq("status", "confirmed").range(0, 4999),
  ]);
  const error = playersResult.error ?? tournamentsResult.error ?? matchesResult.error ?? leagueResult.error ?? ratingResult.error;
  if (error) throw new Error(`Не вдалося завантажити дані рейтингу: ${error.message}`);

  const tournamentDates = new Map((tournamentsResult.data ?? []).map((row) => [row.id, row.tournament_date]));
  const events: RatingEvent[] = [
    ...(matchesResult.data ?? []).map((row) => ({
      ...row, type: "tournament" as const,
      eventDate: tournamentDates.get(row.tournament_id) ?? row.created_at,
      sortKey: `${tournamentDates.get(row.tournament_id) ?? row.created_at}|0|${String(row.round_number ?? 0).padStart(6, "0")}|${row.created_at}|${row.id}`,
    })),
    ...(leagueResult.data ?? []).map((row) => ({
      ...row, type: "league" as const, eventDate: row.played_at ?? row.created_at,
      sortKey: `${row.played_at ?? row.created_at}|1|${row.created_at}|${row.id}`,
    })),
    ...(ratingResult.data ?? []).map((row) => ({
      id: row.id, player1_id: row.challenger_id, player2_id: row.opponent_id, winner_id: row.winner_id,
      player1_set1: row.player1_set1, player2_set1: row.player2_set1, player1_set2: row.player1_set2, player2_set2: row.player2_set2, player1_set3: row.player1_set3, player2_set3: row.player2_set3,
      notes: null, type: "rating_match" as const, eventDate: row.played_at ?? row.confirmed_at ?? row.created_at,
      sortKey: `${row.played_at ?? row.confirmed_at ?? row.created_at}|2|${row.confirmed_at ?? row.created_at}|${row.id}`,
    })),
  ].filter((event) => event.player1_id && event.player2_id && event.winner_id).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const bases = new Map((playersResult.data ?? []).map((row) => [row.id, Number(row.rating_base ?? 3)]));
  const changes = new Map<string, number[]>();
  const current = new Map([...bases].map(([id, base]) => [id, base]));
  const history: HistoryInsert[] = [];

  for (const event of events) {
    if (!bases.has(event.player1_id) || !bases.has(event.player2_id)) continue;
    const rating1 = current.get(event.player1_id) ?? 3;
    const rating2 = current.get(event.player2_id) ?? 3;
    const gameSets = isThirdSetTiebreak(event) ? [1, 2] : [1, 2, 3];
    const games1 = gameSets.reduce((sum, set) => sum + Number(event[`player1_set${set}` as keyof ScoreRow] ?? 0), 0);
    const games2 = gameSets.reduce((sum, set) => sum + Number(event[`player2_set${set}` as keyof ScoreRow] ?? 0), 0);
    const multiplier = round3(1 + Math.min(0.5, Math.abs(games1 - games2) / Math.max(1, games1 + games2)));
    const expected1 = 1 / (1 + Math.pow(10, rating2 - rating1));
    const delta1 = round3(0.05 * ((event.winner_id === event.player1_id ? 1 : 0) - expected1) * multiplier);
    const delta2 = -delta1;
    history.push(historyRow(event, event.player1_id, event.player2_id, rating1, delta1, multiplier));
    history.push(historyRow(event, event.player2_id, event.player1_id, rating2, delta2, multiplier));
    addChange(changes, event.player1_id, delta1); addChange(changes, event.player2_id, delta2);
    current.set(event.player1_id, rollingRating(bases.get(event.player1_id)!, changes.get(event.player1_id)!));
    current.set(event.player2_id, rollingRating(bases.get(event.player2_id)!, changes.get(event.player2_id)!));
  }

  const { error: deleteError } = await db.from("player_rating_history").delete().not("id", "is", null);
  if (deleteError) throw new Error(`Не вдалося очистити стару історію: ${deleteError.message}`);
  for (let index = 0; index < history.length; index += 500) {
    const { error: insertError } = await db.from("player_rating_history").insert(history.slice(index, index + 500));
    if (insertError) throw new Error(`Не вдалося відновити історію рейтингу: ${insertError.message}`);
  }
  const updates = [...bases].map(([id, base]) => db.from("players").update({ rating: round3(current.get(id) ?? base) }).eq("id", id));
  const updateResults = await Promise.all(updates);
  const updateError = updateResults.find((result) => result.error)?.error;
  if (updateError) throw new Error(`Не вдалося зберегти рейтинги: ${updateError.message}`);
  return { players: bases.size, matches: events.length, historyRows: history.length };
}

function historyRow(event: RatingEvent, playerId: string, opponentId: string, before: number, change: number, multiplier: number): HistoryInsert {
  return { player_id: playerId, opponent_id: opponentId, source_type: event.type, source_match_id: event.id, event_date: event.eventDate, rating_before: round3(before), rating_after: round3(clamp(before + change)), rating_change: change, score_multiplier: multiplier, result: change > 0 ? "win" : "loss" };
}
function addChange(changes: Map<string, number[]>, playerId: string, change: number) { const values = changes.get(playerId) ?? []; values.push(change); changes.set(playerId, values); }
function rollingRating(base: number, values: number[]) { return round3(clamp(base + values.slice(-30).reduce((sum, value) => sum + value, 0))); }
