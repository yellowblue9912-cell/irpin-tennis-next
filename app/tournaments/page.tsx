import Link from "next/link";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

type Tournament = {
  id: string;
  title: string;
  slug: string;
  tournament_date: string;
  location: string | null;
  min_rating: number | null;
  max_rating: number | null;
  format: string | null;
  status: string | null;
};

type TournamentPlayer = {
  tournament_id: string;
};

function formatTournamentDate(date: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatLevel(
  minRating: number | null,
  maxRating: number | null,
) {
  if (minRating !== null && maxRating !== null) {
    return `${minRating}–${maxRating}`;
  }

  if (minRating !== null) {
    return `${minRating}+`;
  }

  if (maxRating !== null) {
    return `до ${maxRating}`;
  }

  return "Відкритий";
}

function formatTournamentFormat(format: string | null) {
  if (!format) {
    return "Турнір";
  }

  const formats: Record<string, string> = {
    group: "Груповий етап",
    groups: "Груповий етап",
    group_stage: "Груповий етап",
    playoff: "Плей-оф",
    knockout: "Плей-оф",
    round_robin: "Кожен з кожним",
    custom: "Групи + плей-оф",
  };

  return formats[format.toLowerCase()] ?? format;
}

export default async function TournamentsPage() {
  const supabase = await createClient();

  const { data: tournamentsData, error: tournamentsError } =
    await supabase
      .from("tournaments")
      .select(`
        id,
        title,
        slug,
        tournament_date,
        location,
        min_rating,
        max_rating,
        format,
        status
      `)
      .order("tournament_date", { ascending: false });

  const { data: tournamentPlayersData, error: playersError } =
    await supabase
      .from("tournament_players")
      .select("tournament_id");

  if (tournamentsError) {
    console.error("Помилка завантаження турнірів:", tournamentsError);
  }

  if (playersError) {
    console.error(
      "Помилка завантаження учасників турнірів:",
      playersError,
    );
  }

  const tournaments = (tournamentsData ?? []) as Tournament[];
  const tournamentPlayers =
    (tournamentPlayersData ?? []) as TournamentPlayer[];

  const participantCounts = tournamentPlayers.reduce<
    Record<string, number>
  >((counts, item) => {
    counts[item.tournament_id] =
      (counts[item.tournament_id] ?? 0) + 1;

    return counts;
  }, {});

  return (
    <main className="min-h-screen bg-[#f6f0e5] text-[#123f2d]">
      <section className="relative overflow-hidden bg-[#123f2d] text-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[45px] border-[#d7f34c]/10" />

        <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#d7f34c]">
            Irpin Tennis Tournaments
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black uppercase leading-[0.95] md:text-7xl">
            Історія турнірів
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
            Архів проведених турнірів ліги з результатами,
            призерами та статистикою учасників.
          </p>

          <div className="mt-9 inline-flex rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold">
            Проведено турнірів:
            <span className="ml-2 text-[#d7f34c]">
              {tournaments.length}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        {tournaments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.slug}`}
                className="group rounded-[30px] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <span className="rounded-full bg-[#d7f34c] px-4 py-2 text-xs font-black uppercase tracking-wide">
                    {tournament.status === "finished"
                      ? "Завершено"
                      : tournament.status ?? "Турнір"}
                  </span>

                  <span className="text-sm font-bold text-[#123f2d]/45">
                    {formatTournamentDate(
                      tournament.tournament_date,
                    )}
                  </span>
                </div>

                <h2 className="mt-7 text-3xl font-black uppercase transition group-hover:text-[#ad4529]">
                  {tournament.title}
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-[18px] bg-[#f6f0e5] p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-[#123f2d]/45">
                      Рівень
                    </p>

                    <strong className="mt-2 block text-lg">
                      {formatLevel(
                        tournament.min_rating,
                        tournament.max_rating,
                      )}
                    </strong>
                  </div>

                  <div className="rounded-[18px] bg-[#f6f0e5] p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-[#123f2d]/45">
                      Учасників
                    </p>

                    <strong className="mt-2 block text-lg">
                      {participantCounts[tournament.id] ?? 0}
                    </strong>
                  </div>

                  <div className="rounded-[18px] bg-[#f6f0e5] p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-[#123f2d]/45">
                      Місце
                    </p>

                    <strong className="mt-2 block text-lg">
                      {tournament.location || "Не вказано"}
                    </strong>
                  </div>

                  <div className="rounded-[18px] bg-[#f6f0e5] p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-[#123f2d]/45">
                      Формат
                    </p>

                    <strong className="mt-2 block text-lg">
                      {formatTournamentFormat(tournament.format)}
                    </strong>
                  </div>
                </div>

                <div className="mt-7 flex items-center justify-between border-t border-[#123f2d]/10 pt-5">
                  <span className="font-black">
                    Переглянути результати
                  </span>

                  <span className="text-2xl transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[30px] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-black">
              Турніри не знайдено
            </h2>

            <p className="mt-3 text-[#123f2d]/60">
              Перевір підключення до Supabase або дані в таблиці
              tournaments.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}