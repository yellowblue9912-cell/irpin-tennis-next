"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import {
  createAdminSupabaseClient,
  findAuthUserByEmail,
} from "@/lib/supabase/admin";

export type CreatePlayerState = {
  error: string | null;
};

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

export async function createPlayer(
  _previousState: CreatePlayerState,
  formData: FormData,
): Promise<CreatePlayerState> {
  if (!(await isAdminAuthenticated())) {
    return { error: "Потрібна авторизація адміністратора" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const ratingInput = String(formData.get("rating") ?? "3")
    .trim()
    .replace(",", ".");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name) return { error: "Вкажіть ім'я гравця" };

  const rating = Number(ratingInput);
  if (!Number.isFinite(rating) || rating < 1 || rating > 7) {
    return { error: "Рейтинг повинен бути від 1.00 до 7.00" };
  }

  const supabase = createAdminSupabaseClient();
  let slug: string;
  let authUser: Awaited<ReturnType<typeof findAuthUserByEmail>> = null;

  try {
    slug = await getUniquePlayerSlug(supabase, slugInput || name);
    authUser = email ? await findAuthUserByEmail(email) : null;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Не вдалося перевірити дані",
    };
  }

  if (email && !authUser) {
    return {
      error:
        "Користувача з такою поштою не знайдено. Спочатку він має зареєструватися на сайті",
    };
  }

  if (authUser) {
    const { data: linkedPlayer, error: linkedPlayerError } = await supabase
      .from("players")
      .select("name")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (linkedPlayerError) {
      return { error: linkedPlayerError.message };
    }

    if (linkedPlayer) {
      return {
        error: `Ця пошта вже прив’язана до профілю «${linkedPlayer.name}». Залиште поле пошти порожнім або відредагуйте наявний профіль.`,
      };
    }
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
    return { error: error.message };
  }

  revalidatePath("/admin/players");
  revalidatePath("/players");
  revalidatePath("/rating");
  redirect("/admin/players");
}
