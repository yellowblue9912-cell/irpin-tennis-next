"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type RatingMatchPlayer = {
  id: string;
  name: string;
  slug: string;
  rating: number;
};

export type RatingMatch = {
  id: string;
  challenger_id: string;
  opponent_id: string;
  status: string;
  submitted_by_player_id: string | null;
  winner_id: string | null;
  player1_set1: number | null;
  player2_set1: number | null;
  player1_set2: number | null;
  player2_set2: number | null;
  player1_set3: number | null;
  player2_set3: number | null;
  played_at: string | null;
  created_at: string;
};

type Props = {
  currentPlayer: RatingMatchPlayer;
  opponents: RatingMatchPlayer[];
  matches: RatingMatch[];
};

const statusText: Record<string, string> = {
  pending: "Очікує відповіді",
  accepted: "Виклик прийнято",
  result_pending: "Результат очікує підтвердження",
  confirmed: "Матч підтверджено",
  declined: "Виклик відхилено",
  cancelled: "Виклик скасовано",
};

function score(match: RatingMatch) {
  return [
    [match.player1_set1, match.player2_set1],
    [match.player1_set2, match.player2_set2],
    [match.player1_set3, match.player2_set3],
  ]
    .filter(([a, b]) => a !== null && b !== null)
    .map(([a, b]) => `${a}:${b}`)
    .join(", ");
}

export default function RatingMatchDashboard({
  currentPlayer,
  opponents,
  matches,
}: Props) {
  const router = useRouter();
  const [opponentId, setOpponentId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sets, setSets] = useState([
    ["", ""],
    ["", ""],
    ["", ""],
  ]);
  const [playedAt, setPlayedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const playerMap = useMemo(
    () =>
      new Map(
        [currentPlayer, ...opponents].map((player) => [
          player.id,
          player,
        ]),
      ),
    [currentPlayer, opponents],
  );

  async function run(action: string, payload: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/rating-matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(result.error ?? "Не вдалося виконати дію.");
      return false;
    }
    setMessage(result.message ?? "Готово.");
    router.refresh();
    return true;
  }

  async function submitResult(matchId: string) {
    const normalized = sets.map(([a, b]) => [
      a === "" ? null : Number(a),
      b === "" ? null : Number(b),
    ]);
    if (
      await run("submit_result", {
        matchId,
        playedAt,
        sets: normalized,
      })
    ) {
      setEditingId(null);
      setSets([
        ["", ""],
        ["", ""],
        ["", ""],
      ]);
    }
  }

  return (
    <section className="mt-8 rounded-[28px] bg-white p-5 shadow-sm sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ad4529]">
        Рейтингові матчі
      </p>
      <h2 className="mt-2 text-2xl font-black uppercase sm:text-3xl">
        Виклик гравцю
      </h2>
      <p className="mt-3 max-w-3xl leading-7 text-[#123f2d]/65">
        Домовтеся про матч поза турніром або лігою. Після гри один
        учасник вносить рахунок, а другий підтверджує його. Лише тоді
        матч потрапляє в історію та впливає на рейтинг.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <select
          value={opponentId}
          onChange={(event) => setOpponentId(event.target.value)}
          className="min-h-12 flex-1 rounded-xl border border-[#123f2d]/15 bg-[#f4efe4] px-4 font-bold"
        >
          <option value="">Оберіть зареєстрованого гравця</option>
          {opponents.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name} — {Number(player.rating).toFixed(2)}
            </option>
          ))}
        </select>
        <button
          disabled={!opponentId || busy}
          onClick={async () => {
            if (await run("create", { opponentId })) setOpponentId("");
          }}
          className="rounded-xl bg-[#c6f13d] px-6 py-3 font-black disabled:opacity-40"
        >
          Кинути виклик
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-xl bg-[#eef5d4] px-4 py-3 font-bold">
          {message}
        </p>
      )}

      <div className="mt-7 space-y-3">
        <h3 className="text-lg font-black">Ваші матчі та виклики</h3>
        {matches.length === 0 && (
          <p className="rounded-xl bg-[#f4efe4] p-4 text-[#123f2d]/60">
            Тут з’являться надіслані й отримані виклики.
          </p>
        )}
        {matches.map((match) => {
          const isChallenger =
            match.challenger_id === currentPlayer.id;
          const challenger = playerMap.get(match.challenger_id);
          const challengedPlayer = playerMap.get(match.opponent_id);
          const opponent = playerMap.get(
            isChallenger ? match.opponent_id : match.challenger_id,
          );
          const awaitingMyConfirmation =
            match.status === "result_pending" &&
            match.submitted_by_player_id !== currentPlayer.id;
          return (
            <article
              key={match.id}
              className="rounded-2xl border border-[#123f2d]/10 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#ad4529]">
                    {statusText[match.status] ?? match.status}
                  </p>
                  <p className="mt-1 text-lg font-black">
                    {challenger?.name ?? "Гравець"} —{" "}
                    {challengedPlayer?.name ?? "Гравець"}
                  </p>
                  {score(match) && (
                    <p className="mt-1 text-xl font-black">
                      {score(match)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {match.status === "pending" &&
                    !isChallenger && (
                      <>
                        <button
                          disabled={busy}
                          onClick={() =>
                            run("respond", {
                              matchId: match.id,
                              accept: true,
                            })
                          }
                          className="rounded-full bg-[#c6f13d] px-4 py-2 text-sm font-black"
                        >
                          Прийняти
                        </button>
                        <button
                          disabled={busy}
                          onClick={() =>
                            run("respond", {
                              matchId: match.id,
                              accept: false,
                            })
                          }
                          className="rounded-full border px-4 py-2 text-sm font-black"
                        >
                          Відхилити
                        </button>
                      </>
                    )}
                  {match.status === "accepted" && (
                    <button
                      onClick={() =>
                        setEditingId(
                          editingId === match.id ? null : match.id,
                        )
                      }
                      className="rounded-full bg-[#123f2d] px-4 py-2 text-sm font-black text-white"
                    >
                      Внести результат
                    </button>
                  )}
                  {awaitingMyConfirmation && (
                    <>
                      <button
                        disabled={busy}
                        onClick={() =>
                          run("confirm", {
                            matchId: match.id,
                            approve: true,
                          })
                        }
                        className="rounded-full bg-[#c6f13d] px-4 py-2 text-sm font-black"
                      >
                        Підтвердити
                      </button>
                      <button
                        disabled={busy}
                        onClick={() =>
                          run("confirm", {
                            matchId: match.id,
                            approve: false,
                          })
                        }
                        className="rounded-full border px-4 py-2 text-sm font-black"
                      >
                        Не погоджуюсь
                      </button>
                    </>
                  )}
                  {((match.status === "pending" && isChallenger) ||
                    match.status === "accepted") && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        run("cancel", { matchId: match.id })
                      }
                      className="rounded-full border px-4 py-2 text-sm font-black"
                    >
                      Скасувати
                    </button>
                  )}
                </div>
              </div>

              {editingId === match.id && (
                <div className="mt-5 rounded-2xl bg-[#f4efe4] p-4">
                  <p className="font-black">
                    Рахунок: {challenger?.name ?? "Гравець"} —{" "}
                    {challengedPlayer?.name ?? "Гравець"}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
                    {sets.map((set, setIndex) =>
                      set.map((value, playerIndex) => (
                        <input
                          key={`${setIndex}-${playerIndex}`}
                          type="number"
                          min="0"
                          max="99"
                          value={value}
                          aria-label={`Сет ${setIndex + 1}, гравець ${playerIndex + 1}`}
                          placeholder={`С${setIndex + 1}`}
                          onChange={(event) =>
                            setSets((current) =>
                              current.map((row, rowIndex) =>
                                rowIndex === setIndex
                                  ? row.map((cell, cellIndex) =>
                                      cellIndex === playerIndex
                                        ? event.target.value
                                        : cell,
                                    )
                                  : row,
                              ),
                            )
                          }
                          className="min-h-11 rounded-xl border border-[#123f2d]/15 bg-white px-3 font-black"
                        />
                      )),
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="date"
                      value={playedAt}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(event) => setPlayedAt(event.target.value)}
                      className="min-h-11 rounded-xl border border-[#123f2d]/15 bg-white px-3 font-bold"
                    />
                    <button
                      disabled={busy}
                      onClick={() => submitResult(match.id)}
                      className="rounded-xl bg-[#c6f13d] px-5 py-3 font-black"
                    >
                      Надіслати на підтвердження
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
