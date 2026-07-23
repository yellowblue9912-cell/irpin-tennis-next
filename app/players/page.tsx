import Footer from "@/components/Footer";
import PlayersSearch from "@/components/PlayersSearch";
import { players } from "@/app/data/players";

export default function PlayersPage() {
  const sortedPlayers = [...players].sort(
    (a, b) => b.rating - a.rating,
  );

  return (
    <main className="min-h-screen bg-[#f6f0e5] text-[#123f2d]">
      <section className="relative overflow-hidden bg-[#123f2d] text-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[45px] border-[#d7f34c]/10" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#d7f34c]">
            Irpin Tennis Community
          </p>

          <h1 className="mt-5 text-4xl font-black uppercase leading-none md:text-6xl">
            Рейтинг гравців
          </h1>

          <p className="mt-5 max-w-2xl text-base text-white/65 md:text-lg">
            Рейтинг учасників тенісної спільноти Ірпеня, Бучі та Києва.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
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

      <PlayersSearch />

      <Footer />
    </main>
  );
}