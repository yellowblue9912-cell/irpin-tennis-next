import { NextResponse } from "next/server";
import { getPlayerName } from "@/lib/players/getPlayerPhoto";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: player, error } = await supabase
    .from("players")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Breadcrumb player lookup error:", error);
    return NextResponse.json({ error: "Не вдалося завантажити ім’я." }, { status: 500 });
  }

  if (!player) {
    return NextResponse.json({ error: "Гравця не знайдено." }, { status: 404 });
  }

  return NextResponse.json({ name: getPlayerName(slug, player.name) });
}
