"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function readSeasonId(formData: FormData) {
  const seasonId = String(formData.get("season_id") ?? "").trim();

  if (!/^[0-9a-f-]{36}$/i.test(seasonId)) {
    throw new Error("Некоректний ідентифікатор сезону");
  }

  return seasonId;
}

export async function finishLeagueSeason(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Потрібна авторизація адміністратора");
  }

  const seasonId = readSeasonId(formData);
  const supabase = createAdminSupabaseClient();
  const [seasonResult, participantsResult, matchesResult] = await Promise.all([
    supabase
      .from("league_seasons")
      .select("id, title, is_active")
      .eq("id", seasonId)
      .maybeSingle(),
    supabase
      .from("league_players")
      .select("player_id")
      .eq("season_id", seasonId),
    supabase
      .from("league_matches")
      .select("id, winner_id")
      .eq("season_id", seasonId),
  ]);

  if (seasonResult.error || !seasonResult.data) {
    throw new Error("Сезон ліги не знайдено");
  }
  if (participantsResult.error || matchesResult.error) {
    throw new Error("Не вдалося перевірити повноту сезону");
  }

  const participantCount = participantsResult.data.length;
  const expectedMatchCount = (participantCount * (participantCount - 1)) / 2;
  const matches = matchesResult.data;

  if (
    participantCount < 2 ||
    matches.length !== expectedMatchCount ||
    matches.some((match) => !match.winner_id)
  ) {
    throw new Error(
      `Сезон ще не завершений: зіграно ${matches.length} із ${expectedMatchCount} матчів`,
    );
  }

  const { data, error } = await supabase
    .from("league_seasons")
    .update({ is_active: false })
    .eq("id", seasonId)
    .eq("is_active", true)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Не вдалося завершити сезон: ${error.message}`);
  }
  if (!data && seasonResult.data.is_active) {
    throw new Error("Сезон не було оновлено");
  }

  revalidatePath("/league/[slug]", "page");
  revalidatePath("/tournaments");
  revalidatePath("/players/[slug]", "page");
  revalidatePath("/admin/leagues");
  redirect("/admin/leagues?finished=1");
}
