"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { isThirdSetTiebreak } from "@/lib/matches/tiebreak";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { recalculateAllRatings } from "@/lib/rating/recalculateAllRatings";

type MatchType = "league" | "rating" | "tournament";
type Standing = { matches_played: number; wins: number; losses: number; sets_difference: number; games_difference: number; points: number };
type LeagueMatch = { id: string; player1_id: string; player2_id: string; winner_id: string; player1_set1: number | null; player2_set1: number | null; player1_set2: number | null; player2_set2: number | null; player1_set3: number | null; player2_set3: number | null; notes: string | null };
const tableByType = { league: "league_matches", rating: "rating_matches", tournament: "matches" } as const;

function readType(formData: FormData): MatchType {
  const type = String(formData.get("match_type") ?? "");
  if (type !== "league" && type !== "rating" && type !== "tournament") throw new Error("Некоректний тип матчу");
  return type;
}
function readId(formData: FormData) {
  const id = String(formData.get("match_id") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Некоректний ідентифікатор матчу");
  return id;
}
function readScore(formData: FormData, name: string) {
  const raw = String(formData.get(name) ?? "").trim();
  if (raw === "") return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > 99) throw new Error("Рахунок сету має бути цілим числом від 0 до 99");
  return value;
}

export async function updateMatchScore(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Потрібна авторизація адміністратора");
  const type = readType(formData);
  const matchId = readId(formData);
  const sets = [1, 2, 3].map((number) => [readScore(formData, `player1_set${number}`), readScore(formData, `player2_set${number}`)] as const);
  const playedSets = sets.filter(([left, right]) => left !== null || right !== null);
  if (playedSets.length < 2) throw new Error("Вкажіть рахунок щонайменше двох сетів");
  if (playedSets.some(([left, right]) => left === null || right === null || left === right)) throw new Error("У кожному зіграному сеті вкажіть різний рахунок обох гравців");
  if (sets[1][0] === null && sets[2][0] !== null) throw new Error("Третій сет не можна вказати без другого");

  const supabase = createAdminSupabaseClient();
  const table = tableByType[type];
  const columns = type === "rating" ? "challenger_id, opponent_id" : "player1_id, player2_id";
  const { data: target, error: targetError } = await supabase.from(table).select(`${columns}${type === "league" ? ", season_id" : ""}`).eq("id", matchId).maybeSingle();
  if (targetError || !target) throw new Error("Матч не знайдено");
  const row = target as unknown as Record<string, string>;
  const player1Id = type === "rating" ? row.challenger_id : row.player1_id;
  const player2Id = type === "rating" ? row.opponent_id : row.player2_id;
  const player1Sets = playedSets.filter(([left, right]) => Number(left) > Number(right)).length;
  const player2Sets = playedSets.length - player1Sets;
  if (player1Sets === player2Sets) throw new Error("За цим рахунком неможливо визначити переможця");
  const [set1, set2, set3] = sets;
  const { error } = await supabase.from(table).update({
    winner_id: player1Sets > player2Sets ? player1Id : player2Id,
    player1_set1: set1[0], player2_set1: set1[1], player1_set2: set2[0], player2_set2: set2[1], player1_set3: set3[0], player2_set3: set3[1],
    ...(type === "rating" ? { updated_at: new Date().toISOString() } : {}),
  }).eq("id", matchId);
  if (error) throw new Error(`Не вдалося оновити матч: ${error.message}`);
  if (type === "league") await rebuildLeagueStandings(row.season_id);
  await recalculateRatings();
  revalidateMatchPages();
  redirect("/admin/matches?updated=1");
}

export async function deleteMatch(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Потрібна авторизація адміністратора");
  const type = readType(formData);
  const matchId = readId(formData);
  const supabase = createAdminSupabaseClient();
  const table = tableByType[type];
  const { data: target, error: targetError } = await supabase.from(table).select(type === "league" ? "id, season_id" : "id").eq("id", matchId).maybeSingle();
  if (targetError || !target) throw new Error("Матч не знайдено або його вже видалено");
  const { error } = await supabase.from(table).delete().eq("id", matchId);
  if (error) throw new Error(`Не вдалося видалити матч: ${error.message}`);
  if (type === "league") await rebuildLeagueStandings((target as unknown as { season_id: string }).season_id);
  await recalculateRatings();
  revalidateMatchPages();
  redirect("/admin/matches?deleted=1");
}

export async function deleteLeagueMatch(formData: FormData) { formData.set("match_type", "league"); return deleteMatch(formData); }

async function recalculateRatings() {
  await recalculateAllRatings();
}

export async function repairAllRatings() {
  if (!(await isAdminAuthenticated())) throw new Error("Потрібна авторизація адміністратора");
  await recalculateAllRatings();
  revalidateMatchPages();
  redirect("/admin/matches?ratings_repaired=1");
}
function revalidateMatchPages() {
  revalidatePath("/matches"); revalidatePath("/players"); revalidatePath("/players/[slug]", "page"); revalidatePath("/tournaments"); revalidatePath("/tournaments/[slug]", "page"); revalidatePath("/league/[slug]", "page"); revalidatePath("/account"); revalidatePath("/admin/matches");
}

async function rebuildLeagueStandings(seasonId: string) {
  const supabase = createAdminSupabaseClient();
  const [{ data: memberships, error: membershipError }, { data: matches, error: matchError }] = await Promise.all([
    supabase.from("league_players").select("player_id").eq("season_id", seasonId),
    supabase.from("league_matches").select("id, player1_id, player2_id, winner_id, player1_set1, player2_set1, player1_set2, player2_set2, player1_set3, player2_set3, notes").eq("season_id", seasonId),
  ]);
  if (membershipError || matchError) throw new Error("Матч змінено, але не вдалося завантажити таблицю ліги");
  const standings = new Map<string, Standing>();
  for (const membership of memberships ?? []) standings.set(membership.player_id, emptyStanding());
  for (const match of (matches ?? []) as LeagueMatch[]) applyMatch(standings, match);
  const results = await Promise.all([...standings.entries()].map(([playerId, standing]) => supabase.from("league_players").update(standing).eq("season_id", seasonId).eq("player_id", playerId)));
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(`Не вдалося перерахувати таблицю ліги: ${failed.error.message}`);
}
function applyMatch(standings: Map<string, Standing>, match: LeagueMatch) {
  const first = standings.get(match.player1_id); const second = standings.get(match.player2_id);
  if (!first || !second || !match.winner_id) return;
  const sets = [[match.player1_set1, match.player2_set1], [match.player1_set2, match.player2_set2], [match.player1_set3, match.player2_set3]].filter((set): set is [number, number] => set[0] !== null && set[1] !== null);
  const firstSets = sets.filter(([left, right]) => left > right).length; const secondSets = sets.filter(([left, right]) => right > left).length;
  const gamesSets = isThirdSetTiebreak(match) ? sets.slice(0, 2) : sets;
  const firstGames = gamesSets.reduce((sum, [score]) => sum + score, 0); const secondGames = gamesSets.reduce((sum, [, score]) => sum + score, 0);
  first.matches_played++; second.matches_played++; first.sets_difference += firstSets - secondSets; second.sets_difference += secondSets - firstSets; first.games_difference += firstGames - secondGames; second.games_difference += secondGames - firstGames;
  if (match.winner_id === match.player1_id) { first.wins++; second.losses++; first.points += 2; second.points++; } else { second.wins++; first.losses++; second.points += 2; first.points++; }
}
function emptyStanding(): Standing { return { matches_played: 0, wins: 0, losses: 0, sets_difference: 0, games_difference: 0, points: 0 }; }
