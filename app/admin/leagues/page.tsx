import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { finishLeagueSeason } from "./actions";

type PageProps = {
  searchParams: Promise<{ finished?: string }>;
};

export default async function AdminLeaguesPage({ searchParams }: PageProps) {
  const { finished } = await searchParams;
  const supabase = createAdminSupabaseClient();
  const [{ data: seasons, error }, { data: participants }, { data: matches }] =
    await Promise.all([
      supabase
        .from("league_seasons")
        .select("id, title, start_date, end_date, is_active")
        .order("start_date", { ascending: false }),
      supabase.from("league_players").select("season_id"),
      supabase.from("league_matches").select("season_id, winner_id"),
    ]);

  if (error) throw new Error(`Не вдалося завантажити ліги: ${error.message}`);

  return (
    <main>
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
        Сезони
      </p>
      <h1 className="mt-2 text-4xl font-black uppercase">Керування лігами</h1>

      {finished === "1" && (
        <p className="mt-5 rounded-2xl bg-emerald-100 px-5 py-4 font-bold text-emerald-800">
          Сезон завершено. Фінальні місця та нагороди зафіксовані.
        </p>
      )}

      <section className="mt-7 grid gap-4">
        {(seasons ?? []).map((season) => {
          const participantCount = (participants ?? []).filter(
            (item) => item.season_id === season.id,
          ).length;
          const seasonMatches = (matches ?? []).filter(
            (match) => match.season_id === season.id,
          );
          const expectedMatchCount =
            (participantCount * (participantCount - 1)) / 2;
          const isComplete =
            participantCount >= 2 &&
            seasonMatches.length === expectedMatchCount &&
            seasonMatches.every((match) => Boolean(match.winner_id));

          return (
            <article
              key={season.id}
              className="rounded-[28px] bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black">{season.title}</h2>
                    <span className="rounded-full bg-[#f6f0e5] px-3 py-1 text-xs font-black">
                      {season.is_active ? "Активний" : "Завершено"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#123f2d]/55">
                    {participantCount} учасників · {seasonMatches.length} із{" "}
                    {expectedMatchCount} матчів
                  </p>
                </div>

                {season.is_active && (
                  <form action={finishLeagueSeason}>
                    <input type="hidden" name="season_id" value={season.id} />
                    <button
                      disabled={!isComplete}
                      className="rounded-full bg-[#123f2d] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ad4529] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Завершити сезон і присудити нагороди
                    </button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
