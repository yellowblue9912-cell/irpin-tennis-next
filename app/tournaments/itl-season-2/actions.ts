"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSeason2Groups } from "@/lib/league/season2";

const RETURN_PATH = "/tournaments/itl-season-2";
const REGISTRATION_DEADLINE = new Date("2026-09-20T20:59:59Z");

async function checkRosterUnlocked(playerId: string) {
  const groups = await getSeason2Groups();
  if (groups.some((group) => group.participants.some((player) => player.id === playerId))) {
    redirect(`${RETURN_PATH}?error=roster_locked`);
  }
}

export async function registerForSeason2(formData: FormData) {
  const division = String(formData.get("division") ?? "");
  if (division !== "general" && division !== "women") {
    redirect(`${RETURN_PATH}?error=invalid_division`);
  }
  if (new Date() > REGISTRATION_DEADLINE) {
    redirect(`${RETURN_PATH}?error=registration_closed`);
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect(`/login?next=${encodeURIComponent(RETURN_PATH)}`);
  }

  const admin = createAdminSupabaseClient();
  const { data: player } = await admin
    .from("players")
    .select("id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!player) {
    redirect(`${RETURN_PATH}?error=no_player_profile`);
  }

  await checkRosterUnlocked(player.id);

  const { data: existingRegistration } = await admin
    .from("itl_season_2_registrations")
    .select("division")
    .eq("player_id", player.id)
    .maybeSingle();

  if (existingRegistration) {
    redirect(`${RETURN_PATH}?error=already_registered`);
  }

  const { error } = await admin.from("itl_season_2_registrations").insert({
    user_id: data.user.id,
    player_id: player.id,
    division,
  });

  if (error?.code === "23505") {
    redirect(`${RETURN_PATH}?error=already_registered`);
  }
  if (error) {
    redirect(`${RETURN_PATH}?error=registration_failed`);
  }

  revalidatePath(RETURN_PATH);
  revalidatePath(`${RETURN_PATH}/participants`);
  revalidatePath("/tournaments");
  redirect(`${RETURN_PATH}?registered=${division}`);
}

export async function cancelSeason2Registration() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect(`/login?next=${encodeURIComponent(RETURN_PATH)}`);
  }

  const admin = createAdminSupabaseClient();
  const { data: player, error: playerError } = await admin.from("players").select("id").eq("user_id", data.user.id).maybeSingle();
  if (playerError || !player) redirect(`${RETURN_PATH}?error=cancellation_failed`);
  await checkRosterUnlocked(player.id);
  const { error } = await admin
    .from("itl_season_2_registrations")
    .delete()
    .eq("user_id", data.user.id);

  if (error) {
    redirect(`${RETURN_PATH}?error=cancellation_failed`);
  }

  revalidatePath(RETURN_PATH);
  revalidatePath(`${RETURN_PATH}/participants`);
  revalidatePath("/tournaments");
  redirect(`${RETURN_PATH}?cancelled=1`);
}
