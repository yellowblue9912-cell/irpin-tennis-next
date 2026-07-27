import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

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
