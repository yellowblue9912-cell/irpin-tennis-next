"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { createClient } from "@/lib/supabase/server";

function readScore(formData: FormData, name: string) {
  const raw = String(formData.get(name) ?? "").trim();
  if (raw === "") return null;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > 99) {
    throw new Error("Некоректний рахунок сету");
  }

  return value;
}

export async function createTournamentMatch(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Потрібна авторизація адміністратора");
  }

  const tournamentId = String(formData.get("tournament_id") ?? "").trim();
  const player1Id = String(formData.get("player1_id") ?? "").trim();
  const player2Id = String(formData.get("player2_id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const roundNumber = Number(formData.get("round_number"));

  if (!tournamentId || !player1Id || !player2Id) {
    throw new Error("Оберіть турнір і двох гравців");
  }
  if (player1Id === player2Id) {
    throw new Error("Оберіть двох різних гравців");
  }
  if (!Number.isInteger(roundNumber) || roundNumber < 1) {
    throw new Error("Номер матчу має бути додатним цілим числом");
  }

  const sets = [1, 2, 3].map(
    (setNumber) =>
      [
        readScore(formData, `player1_set${setNumber}`),
        readScore(formData, `player2_set${setNumber}`),
      ] as const,
  );
  const playedSets = sets.filter(
    ([first, second]) => first !== null || second !== null,
  );

  if (playedSets.length === 0) {
    throw new Error("Внесіть рахунок хоча б одного сету");
  }
  if (
    playedSets.some(
      ([first, second]) =>
        first === null || second === null || first === second,
    )
  ) {
    throw new Error(
      "У кожному зіграному сеті вкажіть різний рахунок обох гравців",
    );
  }

  const player1SetsWon = playedSets.filter(
    ([first, second]) => Number(first) > Number(second),
  ).length;
  const player2SetsWon = playedSets.length - player1SetsWon;

  if (player1SetsWon === player2SetsWon) {
    throw new Error("За рахунком неможливо визначити переможця");
  }

  const winnerId =
    player1SetsWon > player2SetsWon ? player1Id : player2Id;
  const supabase = await createClient();

  const [{ data: tournament }, { data: memberships, error: membershipError }] =
    await Promise.all([
      supabase
        .from("tournaments")
        .select("id, slug")
        .eq("id", tournamentId)
        .single(),
      supabase
        .from("tournament_players")
        .select("player_id")
        .eq("tournament_id", tournamentId)
        .in("player_id", [player1Id, player2Id]),
    ]);

  if (!tournament) {
    throw new Error("Турнір не знайдено");
  }
  if (membershipError || !memberships || memberships.length !== 2) {
    throw new Error("Обидва гравці мають бути учасниками цього турніру");
  }

  const [set1, set2, set3] = sets;
  const { error: insertError } = await supabase.from("matches").insert({
    tournament_id: tournamentId,
    round_number: roundNumber,
    player1_id: player1Id,
    player2_id: player2Id,
    winner_id: winnerId,
    player1_set1: set1[0],
    player2_set1: set1[1],
    player1_set2: set2[0],
    player2_set2: set2[1],
    player1_set3: set3[0],
    player2_set3: set3[1],
    status: "finished",
    notes: notes || "Додано вручну через адмін-панель",
  });

  if (insertError) {
    throw new Error(`Не вдалося додати матч: ${insertError.message}`);
  }

  const { data: players } = await supabase
    .from("players")
    .select("slug")
    .in("id", [player1Id, player2Id]);

  revalidatePath("/admin/matches");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath("/tournaments");
  revalidatePath(`/tournaments/${tournament.slug}`);
  revalidatePath("/players");
  for (const player of players ?? []) {
    revalidatePath(`/players/${player.slug}`);
  }

  redirect(`/admin/tournaments/${tournamentId}?created=match`);
}
