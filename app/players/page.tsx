import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PlayersSearch from "@/components/PlayersSearch";
import { getPlayers } from "@/lib/players/getPlayers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Гравці та рейтинг тенісистів | Irpin Tennis",
  description:
    "Профілі тенісистів Ірпеня, Бучі та Києва: рейтинг, статистика матчів, перемоги, турніри й досягнення.",
  alternates: { canonical: "/players" },
};

export default async function PlayersPage() {
  const players = await getPlayers();
  const sortedPlayers = [...players].sort(
    (a, b) => b.rating - a.rating,
  );

  return (
    <main className="min-h-screen bg-[#f6f0e5] text-[#123f2d]">
      <section className="relative overflow-hidden bg-[#123f2d] text-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[45px] border-[#d7f34c]/10" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-5 md:py-16">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#d7f34c]">
            Irpin Tennis Community
          </p>

          <h1 className="mt-3 text-3xl font-black uppercase leading-none md:mt-5 md:text-6xl">
            Рейтинг гравців
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-white/65 md:mt-5 md:text-lg">
            Рейтинг учасників тенісної спільноти Ірпеня, Бучі та Києва.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 md:mt-8 md:gap-3">
            <div className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold">
              Гравців:
              <span className="ml-2 text-[#d7f34c]">
                {sortedPlayers.length}
              </span>
            </div>

            <div className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold">
              Найвищий рейтинг:
              <span className="ml-2 text-[#d7f34c]">
                {sortedPlayers[0]?.rating.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <PlayersSearch players={players} />

      <Footer />
    </main>
  );
}
