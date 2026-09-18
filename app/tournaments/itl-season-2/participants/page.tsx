import type { Metadata } from "next";
import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSeason2Groups } from "@/lib/league/season2";
import Season2LeagueCards from "@/components/Season2LeagueCards";

export const metadata: Metadata = {
  title: "Учасники ITL — сезон 2 | Irpin Tennis",
  description: "Затверджені склади Masters, Challenger, Futures A, Futures B та Ladies другого сезону ITL.",
};
export const dynamic = "force-dynamic";

export default async function Season2ParticipantsPage() {
  const groups = await getSeason2Groups();
  const assignedIds = new Set(groups.flatMap((group) => group.participants.map((player) => player.id)));
  const admin = createAdminSupabaseClient();
  const { data: registrations, error } = await admin.from("itl_season_2_registrations")
    .select("player_id, player:players(name, slug)").order("created_at");
  if (error) throw new Error("Не вдалося завантажити заявки");
  const waiting = (registrations ?? []).filter((row) => !assignedIds.has(row.player_id)).flatMap((row) => {
    const player = Array.isArray(row.player) ? row.player[0] : row.player;
    return player ? [player] : [];
  });

  return (
    <main className="min-h-screen bg-[#f6f0e5] px-3 py-4 text-[#123f2d] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/tournaments/itl-season-2" className="text-sm font-black text-[#ad4529]">← До другого сезону</Link>
        <header className="my-4 rounded-2xl bg-[#123f2d] p-5 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-[#d7f34c]">ITL — сезон 2</p>
          <h1 className="mt-2 text-2xl font-black uppercase sm:text-4xl">Склади ліг</h1>
          <p className="mt-3 text-sm leading-6 text-white/75">Склади закріплені організатором. Зміни рейтингу не переміщують учасників між лігами. Оля Кулішенко та Світлана Музика грають також у Ladies.</p>
        </header>
        <Season2LeagueCards groups={groups} showPlayers />
        {waiting.length > 0 && (
          <section className="mt-5 rounded-2xl bg-white p-5">
            <h2 className="font-black">Заявки, що очікують розподілу ({waiting.length})</h2>
            <p className="mt-2 text-sm">Реєстрації збережено. Лігу призначить організатор.</p>
            <ul className="mt-3 space-y-2">
              {waiting.map((player) => <li key={player.slug}><Link className="font-bold" href={`/players/${player.slug}`}>{player.name}</Link></li>)}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
