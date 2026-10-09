"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

async function uniqueSlug(name: string) {
  const supabase = createAdminSupabaseClient();
  const base = name.toLowerCase().trim().normalize("NFKC")
    .replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-").replace(/^-|-$/g, "") || "player";
  let slug = base;
  let suffix = 2;
  while (true) {
    const { data, error } = await supabase.from("players").select("id").eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return slug;
    slug = `${base}-${suffix++}`;
  }
}

export async function reviewProfileClaim(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Потрібна авторизація адміністратора");
  const claimId = String(formData.get("claimId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!claimId || !["approve", "reject"].includes(decision)) throw new Error("Некоректна заявка");

  const supabase = createAdminSupabaseClient();
  const { data: claim, error: claimError } = await supabase
    .from("player_profile_claims")
    .select("id, user_id, requested_player_id, requested_name, status")
    .eq("id", claimId)
    .eq("status", "pending")
    .maybeSingle();
  if (claimError || !claim) throw new Error("Заявку вже опрацьовано або не знайдено");

  if (decision === "approve") {
    if (claim.requested_player_id) {
      const { data: linked, error } = await supabase.from("players")
        .update({ user_id: claim.user_id })
        .eq("id", claim.requested_player_id)
        .is("user_id", null)
        .select("id")
        .maybeSingle();
      if (error || !linked) throw new Error("Цей профіль уже прив’язаний. Відхиліть заявку та попросіть гравця обрати іншу картку.");
    } else if (claim.requested_name) {
      const slug = await uniqueSlug(claim.requested_name);
      const { error } = await supabase.from("players").insert({
        name: claim.requested_name,
        slug,
        rating: 3,
        rating_base: 3,
        user_id: claim.user_id,
        is_active: true,
      });
      if (error) throw new Error(`Не вдалося створити профіль: ${error.message}`);
    }
  }

  const { error: updateError } = await supabase.from("player_profile_claims")
    .update({ status: decision === "approve" ? "approved" : "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", claim.id)
    .eq("status", "pending");
  if (updateError) throw new Error(`Не вдалося оновити заявку: ${updateError.message}`);

  revalidatePath("/admin/players/claims");
  revalidatePath("/admin/players");
  revalidatePath("/account");
  revalidatePath("/players");
}
