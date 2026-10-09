import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Спочатку увійдіть у кабінет." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const playerId = typeof body?.playerId === "string" ? body.playerId : "";
  const requestedName = typeof body?.requestedName === "string"
    ? body.requestedName.trim()
    : "";

  if ((!playerId && requestedName.length < 2) || requestedName.length > 100 || (playerId && requestedName)) {
    return NextResponse.json({ error: "Оберіть профіль або введіть ім’я для нового." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "До вашого акаунта вже прив’язаний профіль гравця." }, { status: 409 });
  }

  const { error } = await supabase.from("player_profile_claims").insert({
    user_id: user.id,
    requested_player_id: playerId || null,
    requested_name: requestedName || null,
  });

  if (error) {
    const message = error.code === "23505"
      ? "У вас уже є заявка на перевірці."
      : error.code === "42501" || error.code === "23503"
        ? "Цей профіль уже недоступний для прив’язки. Оновіть сторінку й оберіть інший."
        : "Не вдалося надіслати заявку. Спробуйте ще раз.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ message: "Заявку надіслано адміністратору на підтвердження." });
}
