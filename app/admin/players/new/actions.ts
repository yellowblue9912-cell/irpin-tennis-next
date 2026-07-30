"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import {
  createAdminSupabaseClient,
  findAuthUserByEmail,
} from "@/lib/supabase/admin";

async function getUniquePlayerSlug(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  requestedSlug: string,
) {
  const baseSlug =
    requestedSlug
      .toLowerCase()
      .trim()
      .normalize("NFKC")
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "player";

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("players")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return candidate;

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function createPlayer(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Потрібна авторизація адміністратора");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const ratingInput = String(formData.get("rating") ?? "3")
    .trim()
    .replace(",", ".");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name) throw new Error("Вкажіть ім'я гравця");

  const rating = Number(ratingInput);
  if (!Number.isFinite(rating) || rating < 1 || rating > 7) {
    throw new Error("Рейтинг повинен бути від 1.00 до 7.00");
  }

  const supabase = createAdminSupabaseClient();
  const slug = await getUniquePlayerSlug(supabase, slugInput || name);
  const authUser = email ? await findAuthUserByEmail(email) : null;

  if (email && !authUser) {
    throw new Error(
      "Користувача з такою поштою не знайдено. Спочатку він має зареєструватися на сайті",
    );
  }

  const { error } = await supabase.from("players").insert({
    name,
    slug,
    rating,
    rating_base: rating,
    user_id: authUser?.id ?? null,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/players");
  revalidatePath("/players");
  revalidatePath("/rating");
  redirect("/admin/players");
}
