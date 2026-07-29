import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTournamentMatch } from "./actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

type Participant = {
  player_id: string;
  players:
    | { id: string; name: string; rating: number }
    | { id: string; name: string; rating: number }[]
    | null;
};

export default async function NewTournamentMatchPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: tournament }, { data: participantData }, { count }] =
    await Promise.all([
      supabase.from("tournaments").select("id, title").eq("id", id).single(),
      supabase
        .from("tournament_players")
        .select("player_id, players(id, name, rating)")
        .eq("tournament_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .eq("tournament_id", id),
    ]);

  if (!tournament) notFound();

  const participants = ((participantData ?? []) as Participant[])
    .map((participant) =>
      Array.isArray(participant.players)
        ? participant.players[0]
        : participant.players,
    )
    .filter(
      (player): player is { id: string; name: string; rating: number } =>
        Boolean(player),
    );
  const inputClass =
    "w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]";

  return (
    <main>
      <Link
        href={`/admin/tournaments/${id}`}
        className="text-sm font-bold text-[#123f2d]/60 transition hover:text-[#123f2d]"
      >
        ← Повернутися до турніру
      </Link>

      <div className="mt-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
          Tournament Match
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase text-[#123f2d]">
          Внести результат
        </h1>
        <p className="mt-3 max-w-3xl text-[#123f2d]/55">
          {tournament.title}. Після збереження матч з’явиться на сторінці
          турніру та в профілях гравців, а рейтинг буде перераховано.
        </p>
      </div>

      {participants.length < 2 ? (
        <div className="mt-8 max-w-3xl rounded-[28px] bg-white p-7 shadow-sm">
          <p className="font-bold text-[#123f2d]">
            Спочатку додайте до турніру щонайменше двох учасників.
          </p>
          <Link
            href={`/admin/tournaments/${id}/participants`}
            className="mt-5 inline-flex rounded-2xl bg-[#123f2d] px-6 py-3 font-black text-white"
          >
            Додати учасників
          </Link>
        </div>
      ) : (
        <form
          action={createTournamentMatch}
          className="mt-8 max-w-4xl rounded-[28px] bg-white p-7 shadow-sm md:p-9"
        >
          <input type="hidden" name="tournament_id" value={id} />

          <label className="block max-w-xs text-sm font-black uppercase tracking-wide">
            Номер матчу
            <input
              name="round_number"
              type="number"
              min="1"
              required
              defaultValue={(count ?? 0) + 1}
              className={`${inputClass} mt-2 normal-case`}
            />
          </label>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {(["player1_id", "player2_id"] as const).map((name, index) => (
              <label
                key={name}
                className="block text-sm font-black uppercase tracking-wide"
              >
                Гравець {index + 1}
                <select
                  name={name}
                  required
                  defaultValue=""
                  className={`${inputClass} mt-2 normal-case`}
                >
                  <option value="" disabled>
                    Оберіть гравця
                  </option>
                  {participants.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name} · {Number(player.rating).toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <fieldset className="mt-8">
            <legend className="text-sm font-black uppercase tracking-wide">
              Рахунок
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((setNumber) => (
                <div key={setNumber} className="rounded-2xl bg-[#f6f0e5] p-4">
                  <p className="text-center text-xs font-black uppercase text-[#123f2d]/50">
                    Сет {setNumber}
                  </p>
                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <input
                      name={`player1_set${setNumber}`}
                      type="number"
                      min="0"
                      max="99"
                      required={setNumber === 1}
                      aria-label={`Гравець 1, сет ${setNumber}`}
                      className="min-w-0 rounded-xl border border-[#123f2d]/15 bg-white px-3 py-2 text-center font-black"
                    />
                    <span className="font-black">:</span>
                    <input
                      name={`player2_set${setNumber}`}
                      type="number"
                      min="0"
                      max="99"
                      required={setNumber === 1}
                      aria-label={`Гравець 2, сет ${setNumber}`}
                      className="min-w-0 rounded-xl border border-[#123f2d]/15 bg-white px-3 py-2 text-center font-black"
                    />
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <label className="mt-6 block text-sm font-black uppercase tracking-wide">
            Примітка
            <textarea
              name="notes"
              rows={3}
              placeholder="Необов’язково"
              className={`${inputClass} mt-2 resize-none normal-case`}
            />
          </label>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-2xl bg-[#123f2d] px-6 py-3 font-black text-white transition hover:bg-[#1b5a41]"
            >
              Зберегти матч
            </button>
            <Link
              href={`/admin/tournaments/${id}`}
              className="rounded-2xl border border-[#123f2d]/15 px-6 py-3 text-center font-black transition hover:bg-[#f6f0e5]"
            >
              Скасувати
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}
