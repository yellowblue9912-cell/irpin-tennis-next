import { getRatingInsights } from "../lib/players/getRatingInsights";

export default async function PlayerRatingInsights({ playerId }: { playerId: string }) {
  const insights = await getRatingInsights(playerId);
  return (
    <section aria-label="Рівень суперників та найкраще місце" className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
      <div className="rounded-2xl border border-[#123f2d]/10 bg-white/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md">
        <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#123f2d]/65">Середній рівень суперників</h2>
        <p className="mt-2 text-3xl font-black text-[#123f2d]">
          {insights?.averageOpponentRating != null ? insights.averageOpponentRating.toFixed(2) : "—"}
        </p>
      </div>
      <div className="rounded-2xl border border-[#123f2d]/10 bg-white/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md">
        <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#123f2d]/65">Найкраще місце в рейтингу</h2>
        <p className="mt-2 text-3xl font-black text-[#123f2d]">
          {insights?.highestRank != null ? `№${insights.highestRank}` : "—"}
        </p>
      </div>
    </section>
  );
}
