"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";

export async function createPlayer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const ratingInput = String(formData.get("rating") ?? "3");

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

  const supabase = await createClient();

  const { error } = await supabase.from("players").insert({
    name,
    slug,
    rating,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/players");
  redirect("/admin/players");
}