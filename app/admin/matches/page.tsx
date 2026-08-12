import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { deleteLeagueMatch } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage() {
  const supabase = createAdminSupabaseClient();
  const { data: matches, error } = await supabase
    .from("league_matches")
    .select(`
      id,
      played_at,
      player1_set1,
      player2_set1,
      player1_set2,
      player2_set2,
      player1_set3,
      player2_set3,
      player1:players!league_matches_player1_id_fkey(name),
      player2:players!league_matches_player2_id_fkey(name),
      winner:players!league_matches_winner_id_fkey(name),
      season:league_seasons!league_matches_season_id_fkey(title)
    `)
    .order("played_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Не вдалося завантажити матчі: ${error.message}`);
  }

  return (
    <main>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
          Результати
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase text-[#123f2d]">
          Матчі
        </h1>
        <p className="mt-3 max-w-3xl text-[#123f2d]/55">
          Додавайте результати або видаляйте помилкові записи. Після видалення
          таблиця ліги та рейтинг перераховуються автоматично.
        </p>
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <Link
          href="/admin/matches/league/new"
          className="group rounded-[28px] bg-[#123f2d] p-7 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          style={{ color: "#ffffff" }}
        >
          <span className="text-4xl">🎾</span>
          <h2 className="mt-6 text-2xl font-black uppercase">Матч ліги</h2>
          <p className="mt-3 leading-7 text-white/65">
            Оберіть сезон і двох учасників, внесіть дату та рахунок.
          </p>
          <span className="mt-7 block font-black text-[#d7f34c]">
            Внести результат →
          </span>
        </Link>

        <Link
          href="/admin/tournaments/new"
          className="group rounded-[28px] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="text-4xl">🏆</span>
          <h2 className="mt-6 text-2xl font-black uppercase text-[#123f2d]">
            Новий турнір
          </h2>
          <p className="mt-3 leading-7 text-[#123f2d]/55">
            Створіть турнір, додайте учасників і внесіть результати.
          </p>
          <span className="mt-7 block font-black text-[#ad4529]">
            Створити турнір →
          </span>
        </Link>
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
            Останні записи
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#123f2d]">
            Останні 20 матчів ліг
          </h2>
        </div>

        <div className="space-y-3">
          {(matches ?? []).map((match) => {
            const player1 = one(match.player1)?.name ?? "Гравець 1";
            const player2 = one(match.player2)?.name ?? "Гравець 2";
            const winner = one(match.winner)?.name ?? "—";
            const season = one(match.season)?.title ?? "Ліга";
            const score = [
              [match.player1_set1, match.player2_set1],
              [match.player1_set2, match.player2_set2],
              [match.player1_set3, match.player2_set3],
            ]
              .filter(([left, right]) => left !== null && right !== null)
              .map(([left, right]) => `${left}:${right}`)
              .join(", ");

            return (
              <article
                key={match.id}
                className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#ad4529]">
                    {season} · {formatDate(match.played_at)}
                  </p>
                  <p className="mt-2 text-lg font-black text-[#123f2d]">
                    {player1} — {player2}
                  </p>
                  <p className="mt-1 text-sm text-[#123f2d]/60">
                    Рахунок: {score || "—"} · Переможець: {winner}
                  </p>
                </div>

                <form action={deleteLeagueMatch}>
                  <input type="hidden" name="match_id" value={match.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-red-700/20 bg-red-50 px-4 py-2.5 text-sm font-black text-red-700 transition hover:bg-red-700 hover:text-white"
                  >
                    Видалити
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(value: string | null) {
  if (!value) return "Дата не вказана";
  return new Intl.DateTimeFormat("uk-UA").format(new Date(`${value}T12:00:00`));
}
