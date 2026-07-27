import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PlayersSearch from "@/components/PlayersSearch";
import { getPlayers } from "@/lib/players/getPlayers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Гравці Irpin Tennis — рейтинг і профілі",
  description:
    "Профілі тенісистів Ірпеня, Бучі та передмістя: рейтинг, статистика матчів, перемоги й участь у турнірах.",
  alternates: { canonical: "/players" },
};

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <main className="min-h-screen bg-[#f6f0e5] text-[#123f2d]">
      <section className="relative overflow-hidden bg-[#123f2d] text-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[45px] border-[#d7f34c]/10" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-5 md:py-16">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#d7f34c]">
            Irpin Tennis Community
          </p>

          <h1 className="mt-3 text-3xl font-black uppercase leading-none md:mt-5 md:text-6xl">
            Гравці
          </h1>

          <div className="mt-4 max-w-3xl md:mt-6">
            <p className="text-sm leading-6 text-white/70 md:text-base">
              Рейтинг автоматично розраховується за останні 30 офіційних
              матчів. Враховуються сила суперника та підсумковий рахунок.
            </p>
            <a
              href="/rating"
              className="mt-2 inline-block text-sm font-black text-[#d7f34c] transition hover:text-white"
            >
              Як працює рейтинг →
            </a>
          </div>
        </div>
      </section>

      <PlayersSearch players={players} />

      <Footer />
    </main>
  );
}
