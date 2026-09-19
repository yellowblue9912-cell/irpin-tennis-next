import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { compareLeagueSeasons } from "@/lib/league/configuration";
import { createLeagueMatch } from "./actions";
import LeagueMatchFields from "./LeagueMatchFields";

export default async function NewLeagueMatchPage({ searchParams }: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: requestedSeason } = await searchParams;
  const supabase = await createClient();
  const [seasonResult, playerResult, membershipResult] = await Promise.all([
    supabase.from("league_seasons").select("id, title, start_date, is_active"),
    supabase.from("players").select("id, name, rating").order("name"),
    supabase.from("league_players").select("season_id, player_id"),
  ]);
  const queryError = seasonResult.error ?? playerResult.error ?? membershipResult.error;
  if (queryError) throw new Error("Не вдалося завантажити ліги та їхні склади");
  const seasons = (seasonResult.data ?? []).sort((a, b) =>
    Number(b.is_active) - Number(a.is_active) || compareLeagueSeasons(a, b));
  const membershipsData = membershipResult.data;
  const memberIds = new Set((membershipsData ?? []).map((row) => row.player_id));
  const players = (playerResult.data ?? []).filter((player) => memberIds.has(player.id));
  const selectedSeason = seasons.some((season) => season.id === requestedSeason) ? requestedSeason! : "";
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
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
        <LeagueMatchFields seasons={seasons} players={players} memberships={membershipsData ?? []} initialSeasonId={selectedSeason} today={today} />

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
