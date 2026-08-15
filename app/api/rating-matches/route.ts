import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { createAdminSupabaseClient } from "../../../lib/supabase/admin";

const errorMessages: Record<string, string> = {
  PLAYER_NOT_LINKED: "Акаунт ще не прив’язаний до картки гравця.",
  CANNOT_CHALLENGE_SELF: "Не можна кинути виклик самому собі.",
  OPPONENT_NOT_AVAILABLE: "Цей гравець поки недоступний для виклику.",
  ACTIVE_CHALLENGE_EXISTS: "Між вами вже є активний виклик.",
  CHALLENGE_NOT_AVAILABLE: "Цей виклик уже недоступний.",
  CHALLENGE_NOT_CANCELLABLE: "Цей виклик уже не можна скасувати.",
  MATCH_NOT_READY: "Матч ще не готовий до внесення результату.",
  INVALID_FIRST_SET: "Перевірте рахунок першого сету.",
  INCOMPLETE_SET: "Заповніть обидва значення сету.",
  INVALID_SET_SCORE: "У сеті не може бути нічиєї.",
  MATCH_HAS_NO_WINNER: "За цим рахунком неможливо визначити переможця.",
  RESULT_NOT_CONFIRMABLE: "Результат уже підтверджено або він недоступний.",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json(
      { error: "Спочатку увійдіть у кабінет." },
      { status: 401 },
    );
  }

  const body = await request.json();

  if (body.action === "confirm") {
    return confirmRatingResult(data.user.id, body.matchId, Boolean(body.approve));
  }

  let rpc = "";
  let args: Record<string, unknown> = {};
  let message = "Готово.";

  switch (body.action) {
    case "create":
      rpc = "create_rating_challenge";
      args = { p_opponent_id: body.opponentId };
      message = "Виклик надіслано.";
      break;
    case "respond":
      rpc = "respond_rating_challenge";
      args = {
        p_match_id: body.matchId,
        p_accept: Boolean(body.accept),
      };
      message = body.accept ? "Виклик прийнято." : "Виклик відхилено.";
      break;
    case "cancel":
      rpc = "cancel_rating_challenge";
      args = { p_match_id: body.matchId };
      message = "Виклик скасовано.";
      break;
    case "submit_result": {
      const sets = Array.isArray(body.sets) ? body.sets : [];
      rpc = "submit_rating_match_result";
      args = {
        p_match_id: body.matchId,
        p_player1_set1: sets[0]?.[0],
        p_player2_set1: sets[0]?.[1],
        p_player1_set2: sets[1]?.[0],
        p_player2_set2: sets[1]?.[1],
        p_player1_set3: sets[2]?.[0],
        p_player2_set3: sets[2]?.[1],
        p_played_at: body.playedAt,
      };
      message = "Результат надіслано супернику.";
      break;
    }
    case "confirm":
      rpc = "confirm_rating_match_result";
      args = {
        p_match_id: body.matchId,
        p_approve: Boolean(body.approve),
      };
      message = body.approve
        ? "Результат підтверджено. Рейтинг оновлено."
        : "Результат повернено на виправлення.";
      break;
    default:
      return NextResponse.json({ error: "Невідома дія." }, { status: 400 });
  }

  const { error } = await supabase.rpc(rpc, args);
  if (error) {
    const known = Object.keys(errorMessages).find((key) =>
      error.message.includes(key),
    );
    return NextResponse.json(
      { error: known ? errorMessages[known] : error.message },
      { status: 400 },
    );
  }

  return NextResponse.json({ message });
}

async function confirmRatingResult(
  userId: string,
  matchId: string,
  approve: boolean,
) {
  const admin = createAdminSupabaseClient();
  const [{ data: currentPlayer }, { data: match }] = await Promise.all([
    admin.from("players").select("id").eq("user_id", userId).maybeSingle(),
    admin
      .from("rating_matches")
      .select("id, status, challenger_id, opponent_id, submitted_by_player_id")
      .eq("id", matchId)
      .maybeSingle(),
  ]);

  const canConfirm =
    currentPlayer &&
    match &&
    match.status === "result_pending" &&
    match.submitted_by_player_id !== currentPlayer.id &&
    (match.challenger_id === currentPlayer.id ||
      match.opponent_id === currentPlayer.id);

  if (!canConfirm) {
    return NextResponse.json(
      { error: errorMessages.RESULT_NOT_CONFIRMABLE },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const values = approve
    ? { status: "confirmed", confirmed_at: now, updated_at: now }
    : {
        status: "accepted",
        submitted_by_player_id: null,
        winner_id: null,
        player1_set1: null,
        player2_set1: null,
        player1_set2: null,
        player2_set2: null,
        player1_set3: null,
        player2_set3: null,
        played_at: null,
        result_submitted_at: null,
        updated_at: now,
      };
  const { error } = await admin
    .from("rating_matches")
    .update(values)
    .eq("id", match.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath("/matches");
  revalidatePath("/players");
  revalidatePath("/players/[slug]", "page");
  revalidatePath("/account");

  return NextResponse.json({
    message: approve
      ? "Результат підтверджено. Рейтинг оновлено."
      : "Результат повернено на виправлення.",
  });
}
