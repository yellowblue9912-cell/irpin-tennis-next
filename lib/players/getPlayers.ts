import { createClient } from "../supabase/server";
import type { Player } from "../../types/player";
import { getPlayerName, getPlayerPhoto } from "./getPlayerPhoto";

export async function getPlayers(): Promise<Player[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select(
      `
        id,
        name,
        slug,
        rating,
        photo_url,
        city,
        is_active,
        created_at,
        updated_at
      `
    )
    .order("rating", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Get players error:", error);
    return [];
  }

  return ((data ?? []) as Player[]).map((player) => ({
    ...player,
    name: getPlayerName(player.slug, player.name),
    photo_url: getPlayerPhoto(player.slug, player.photo_url),
  }));
}
