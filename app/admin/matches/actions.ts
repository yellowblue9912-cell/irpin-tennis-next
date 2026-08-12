"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isThirdSetTiebreak } from "@/lib/matches/tiebreak";

type LeagueMatch = {
  id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string;
  player1_set1: number | null;
  player2_set1: number | null;
  player1_set2: number | null;
  player2_set2: number | null;
  player1_set3: number | null;
  player2_set3: number | null;
  notes: string | null;
};

type Standing = {
  matches_played: number;
  wins: number;
  losses: number;
  sets_difference: number;
  games_difference: number;
  points: number;
};

export async function deleteLeagueMatch(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Потрібна авторизація адміністратора");
  }

  const matchId = String(formData.get("match_id") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(matchId)) {
    throw new Error("Некоректний ідентифікатор матчу");
  }

  const supabase = createAdminSupabaseClient();
  const { data: target, error: targetError } = await supabase
    .from("league_matches")
    .select("id, season_id")
    .eq("id", matchId)
    .maybeSingle();

  if (targetError || !target) {
    throw new Error("Матч не знайдено або його вже видалено");
  }

  const { error: deleteError } = await supabase
    .from("league_matches")
    .delete()
    .eq("id", matchId);
  if (deleteError) {
    throw new Error(`Не вдалося видалити матч: ${deleteError.message}`);
  }

  await rebuildLeagueStandings(target.season_id);

  const { error: ratingError } = await supabase.rpc("recalculate_player_ratings");
  if (ratingError) {
    throw new Error(`Матч видалено, але рейтинг не перераховано: ${ratingError.message}`);
  }

  revalidatePath("/matches");
  revalidatePath("/players");
  revalidatePath("/tournaments");
  revalidatePath("/league/masters");
  revalidatePath("/league/challenger");
  revalidatePath("/league/ladies");
  revalidatePath("/admin/matches");
  redirect("/admin/matches?deleted=league");
}

async function rebuildLeagueStandings(seasonId: string) {
  const supabase = createAdminSupabaseClient();
  const [{ data: memberships, error: membershipError }, { data: matches, error: matchError }] =
    await Promise.all([
      supabase.from("league_players").select("player_id").eq("season_id", seasonId),
      supabase
        .from("league_matches")
        .select("id, player1_id, player2_id, winner_id, player1_set1, player2_set1, player1_set2, player2_set2, player1_set3, player2_set3, notes")
        .eq("season_id", seasonId),
    ]);

  if (membershipError || matchError) {
    throw new Error("Матч видалено, але не вдалося завантажити таблицю ліги");
  }

  const standings = new Map<string, Standing>();
  for (const membership of memberships ?? []) {
    standings.set(membership.player_id, emptyStanding());
  }

  for (const match of (matches ?? []) as LeagueMatch[]) {
    applyMatch(standings, match);
  }

  const updates = [...standings.entries()].map(([playerId, standing]) =>
    supabase
      .from("league_players")
      .update(standing)
      .eq("season_id", seasonId)
      .eq("player_id", playerId),
  );
  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) {
    throw new Error(`Матч видалено, але таблицю не перераховано: ${failed.error.message}`);
  }
}

function applyMatch(standings: Map<string, Standing>, match: LeagueMatch) {
  const first = standings.get(match.player1_id);
  const second = standings.get(match.player2_id);
  if (!first || !second || !match.winner_id) return;

  const sets = [
    [match.player1_set1, match.player2_set1],
    [match.player1_set2, match.player2_set2],
    [match.player1_set3, match.player2_set3],
  ].filter(
    (set): set is [number, number] => set[0] !== null && set[1] !== null,
  );
  const firstSets = sets.filter(([left, right]) => left > right).length;
  const secondSets = sets.filter(([left, right]) => right > left).length;
  const setsDifference = firstSets - secondSets;
  const gamesSets = isThirdSetTiebreak(match) ? sets.slice(0, 2) : sets;
  const firstGames = gamesSets.reduce((total, [score]) => total + score, 0);
  const secondGames = gamesSets.reduce((total, [, score]) => total + score, 0);
  const gamesDifference = firstGames - secondGames;

  first.matches_played += 1;
  second.matches_played += 1;
  first.sets_difference += setsDifference;
  second.sets_difference -= setsDifference;
  first.games_difference += gamesDifference;
  second.games_difference -= gamesDifference;

  if (match.winner_id === match.player1_id) {
    first.wins += 1;
    second.losses += 1;
    first.points += 2;
    second.points += 1;
  } else {
    second.wins += 1;
    first.losses += 1;
    second.points += 2;
    first.points += 1;
  }
}

function emptyStanding(): Standing {
  return {
    matches_played: 0,
    wins: 0,
    losses: 0,
    sets_difference: 0,
    games_difference: 0,
    points: 0,
  };
}
