import Link from "next/link";
import type { getSeason2Groups } from "@/lib/league/season2";

type Groups = Awaited<ReturnType<typeof getSeason2Groups>>;

export default function Season2LeagueCards({ groups, showPlayers = false }: { groups: Groups; showPlayers?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <section key={group.id} className="overflow-hidden rounded-2xl border border-[#123f2d]/15 bg-white shadow-sm">
          <Link href={`/league/${group.slug}`} className="flex items-center justify-between gap-3 px-4 py-4" style={{ backgroundColor: group.color, color: "#ffffff" }}>
            <div>
              <h2 className="text-lg font-black uppercase" style={{ color: "#ffffff" }}>{group.shortTitle}</h2>
              <p className="mt-1 text-xs" style={{ color: "#ffffff" }}>Сезон 2 · {group.participants.length} учасників</p>
            </div>
            <span aria-hidden="true">→</span>
          </Link>
          {showPlayers && (
            <ol className="divide-y divide-[#123f2d]/10">
              {group.participants.map((player, index) => (
                <li key={player.id} className="flex items-center gap-2 px-3 py-3 text-sm">
                  <span className="w-5 shrink-0 text-xs text-[#123f2d]/50">{index + 1}.</span>
                  <Link href={`/players/${player.slug}`} className="min-w-0 flex-1 font-bold break-words">{player.name}</Link>
                  <span className="shrink-0 rounded-full bg-[#f6f0e5] px-2 py-1 text-xs font-bold">{player.rating.toFixed(2)}</span>
                </li>
              ))}
            </ol>
          )}
          <Link href={`/league/${group.slug}`} className="block px-4 py-3 text-sm font-black text-[#123f2d]">Таблиця та матчі →</Link>
        </section>
      ))}
    </div>
  );
}
