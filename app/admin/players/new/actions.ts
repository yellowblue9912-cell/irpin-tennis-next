"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import {
  createAdminSupabaseClient,
  findAuthUserByEmail,
} from "@/lib/supabase/admin";

export async function createPlayer(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Потрібна авторизація адміністратора");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const ratingInput = String(formData.get("rating") ?? "3");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name) {
    throw new Error("Вкажіть ім'я гравця");
  }

  const rating = Number(ratingInput);

  const slug =
    slugInput ||
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-zа-яіїєґ0-9-]/gi, "");

  const supabase = createAdminSupabaseClient();
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
    user_id: authUser?.id ?? null,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/players");
  redirect("/admin/players");
}
