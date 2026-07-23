import { createClient } from "../supabase/server";

export async function getTournaments() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("tournament_date", { ascending: false });

  if (error) {
    console.error("Get tournaments error:", error);
    return [];
  }

  return data ?? [];
}