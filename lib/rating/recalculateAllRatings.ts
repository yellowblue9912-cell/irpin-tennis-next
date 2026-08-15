import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function recalculateAllRatings() {
  const db = createAdminSupabaseClient();
  const { error } = await db.rpc("recalculate_player_ratings");
  if (error) {
    throw new Error(`Не вдалося перерахувати рейтинг: ${error.message}`);
  }
}
