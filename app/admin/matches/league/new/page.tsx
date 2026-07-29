import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createLeagueMatch } from "./actions";

type SeasonRow = {
  id: string;
  title: string;
  is_active: boolean;
};

type PlayerRow = {
  id: string;
  name: string;
  rating: number;
};

export default async function NewLeagueMatchPage() {
  const supabase = await createClient();
  const [{ data: seasonsData }, { data: playersData }] = await Promise.all([
    supabase
      .from("league_seasons")
      .select("id, title, is_active")
      .order("start_date", { ascending: false }),
    supabase
      .from("players")
      .select("id, name, rating")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  const seasons = (seasonsData ?? []) as SeasonRow[];
  const players = (playersData ?? []) as PlayerRow[];
  const inputClass =
    "w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]";

  return (
    <main>
      <Link
        href="/admin/matches"
        className="text-sm font-bold text-[#123f2d]/60 transition hover:text-[#123f2d]"
      >
        ← Повернутися до матчів
      </Link>

      <div className="mt-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
          League Match
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase text-[#123f2d]">
          Внести матч ліги
        </h1>
        <p className="mt-3 max-w-3xl text-[#123f2d]/55">
          Переможець визначається за рахунком. Після збереження автоматично
          оновляться таблиця ліги, профілі гравців і рейтинг.
        </p>
      </div>

      <form
        action={createLeagueMatch}
        className="mt-8 max-w-4xl rounded-[28px] bg-white p-7 shadow-sm md:p-9"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block text-sm font-black uppercase tracking-wide">
            Ліга та сезон
            <select
              name="season_id"
              required
              defaultValue=""
              className={`${inputClass} mt-2 normal-case`}
            >
              <option value="" disabled>Оберіть сезон</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.title}{season.is_active ? " · активний" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-black uppercase tracking-wide">
            Дата матчу
            <input
              name="played_at"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className={`${inputClass} mt-2 normal-case`}
            />
          </label>
        </div>

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
                <option value="" disabled>Оберіть гравця</option>
                {players.map((player) => (
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
              <div
                key={setNumber}
                className="rounded-2xl bg-[#f6f0e5] p-4"
              >
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
          Формат третього сету
          <select
            name="set3_format"
            defaultValue="full_set"
            className={`${inputClass} mt-2 normal-case`}
          >
            <option value="full_set">Повноцінний третій сет</option>
            <option value="match_tiebreak">Матч-тайбрейк</option>
          </select>
          <span className="mt-2 block text-sm font-normal normal-case text-[#123f2d]/45">
            Для матч-тайбрейку введіть фактичний рахунок, наприклад 10:7.
            Його очки не додаватимуться до різниці геймів.
          </span>
        </label>

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
            href="/admin/matches"
            className="rounded-2xl border border-[#123f2d]/15 px-6 py-3 text-center font-black transition hover:bg-[#f6f0e5]"
          >
            Скасувати
          </Link>
        </div>
      </form>
    </main>
  );
}
