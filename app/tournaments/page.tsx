import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Тенісні турніри в Ірпені | Irpin Tennis",
  description:
    "Майбутні, активні та завершені тенісні турніри Irpin Tennis: дати, учасники, формати, результати й статистика.",
};

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

type ActiveLeagueSeason = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

type LeaguePlayer = {
  season_id: string;
};

type TournamentTab = "upcoming" | "active" | "finished";

type TournamentsPageProps = {
  searchParams: Promise<{
    tab?: string;
    show?: string;
  }>;
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

export default async function TournamentsPage({
  searchParams,
}: TournamentsPageProps) {
  const params = await searchParams;
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

  const { data: activeLeagueSeasonsData, error: leagueSeasonsError } =
    await supabase
      .from("league_seasons")
      .select("id, title, start_date, end_date, is_active")
      .eq("is_active", true)
      .order("start_date", { ascending: false });

  const { data: leaguePlayersData, error: leaguePlayersError } =
    await supabase.from("league_players").select("season_id");

  if (tournamentsError) {
    console.error("Помилка завантаження турнірів:", tournamentsError);
  }

  if (playersError) {
    console.error(
      "Помилка завантаження учасників турнірів:",
      playersError,
    );
  }

  if (leagueSeasonsError) {
    console.error(
      "Помилка завантаження активних сезонів ліги:",
      leagueSeasonsError,
    );
  }

  if (leaguePlayersError) {
    console.error(
      "Помилка завантаження учасників ліги:",
      leaguePlayersError,
    );
  }

  const tournaments = (tournamentsData ?? []) as Tournament[];
  const tournamentPlayers =
    (tournamentPlayersData ?? []) as TournamentPlayer[];
  const activeLeagueSeasons =
    (activeLeagueSeasonsData ?? []) as ActiveLeagueSeason[];
  const leaguePlayers = (leaguePlayersData ?? []) as LeaguePlayer[];

  const participantCounts = tournamentPlayers.reduce<
    Record<string, number>
  >((counts, item) => {
    counts[item.tournament_id] =
      (counts[item.tournament_id] ?? 0) + 1;

    return counts;
  }, {});
  const leagueParticipantCounts = leaguePlayers.reduce<Record<string, number>>(
    (counts, item) => {
      counts[item.season_id] = (counts[item.season_id] ?? 0) + 1;
      return counts;
    },
    {},
  );

  function getLeagueHref(title: string) {
    const normalizedTitle = title.toLowerCase();

    if (normalizedTitle.includes("challenger")) {
      return "/league/challenger";
    }

    if (normalizedTitle.includes("ladies")) {
      return "/league/ladies";
    }

    return "/league/masters";
  }

  const selectedTab: TournamentTab =
    params.tab === "upcoming" || params.tab === "finished"
      ? params.tab
      : "active";
  const showAll = params.show === "all";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function getTournamentTab(tournament: Tournament): TournamentTab {
    const status = tournament.status?.toLowerCase().trim() ?? "";
    const title = tournament.title.toLowerCase();

    if (
      ["active", "live", "ongoing", "in_progress"].includes(status) ||
      title.includes("тенісна ліга")
    ) {
      return "active";
    }

    if (["finished", "completed", "closed"].includes(status)) {
      return "finished";
    }

    const tournamentDate = new Date(
      `${tournament.tournament_date}T12:00:00`,
    );

    return tournamentDate >= today ? "upcoming" : "finished";
  }

  const tabs: Array<{ id: TournamentTab; label: string }> = [
    { id: "upcoming", label: "Майбутні" },
    { id: "active", label: "Активні" },
    { id: "finished", label: "Завершені" },
  ];
  const filteredTournaments = tournaments.filter(
    (tournament) => getTournamentTab(tournament) === selectedTab,
  );
  const visibleTournaments = showAll
    ? filteredTournaments
    : filteredTournaments.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#f6f0e5] text-[#123f2d]">
      <section className="relative overflow-hidden bg-[#123f2d] text-white">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border-[26px] border-[#d7f34c]/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-7 md:py-8">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d7f34c] sm:text-xs">
            Irpin Tennis Tournaments
          </p>

          <h1 className="mt-2 max-w-4xl text-2xl font-black uppercase leading-none sm:text-3xl md:text-4xl">
            Історія турнірів
          </h1>

          <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-white/70 sm:block">
            Архів проведених турнірів ліги з результатами,
            призерами та статистикою учасників.
          </p>

          <div className="mt-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold sm:mt-4">
            Проведено турнірів:
            <span className="ml-2 text-[#d7f34c]">
              {tournaments.length}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-7 sm:px-5 md:py-12">
        <nav
          aria-label="Категорії турнірів"
          className="mb-7 grid grid-cols-3 gap-2 rounded-[22px] bg-white p-2 shadow-sm sm:mb-10 sm:gap-3"
        >
          {tabs.map((tab) => {
            const active = selectedTab === tab.id;
            const tournamentCount = tournaments.filter(
              (tournament) => getTournamentTab(tournament) === tab.id,
            ).length;
            const count =
              tournamentCount +
              (tab.id === "active" ? activeLeagueSeasons.length : 0);

            return (
              <Link
                key={tab.id}
                href={`/tournaments?tab=${tab.id}`}
                className={`rounded-2xl px-2 py-3 text-center text-xs font-black uppercase tracking-wide transition sm:px-5 sm:text-sm ${
                  active
                    ? "bg-[#123f2d] text-white shadow-md"
                    : "text-[#123f2d]/65 hover:bg-[#f6f0e5]"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] sm:ml-2 ${
                    active
                      ? "bg-[#d7f34c] text-[#123f2d]"
                      : "bg-[#f6f0e5]"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>

        {visibleTournaments.length > 0 ||
        (selectedTab === "active" && activeLeagueSeasons.length > 0) ? (
          <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {selectedTab === "active" &&
              activeLeagueSeasons.map((season) => (
                <Link
                  key={`league-${season.id}`}
                  href={getLeagueHref(season.title)}
                  className="group rounded-[24px] border-2 border-[#d7f34c] bg-[#123f2d] p-5 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <span className="rounded-full bg-[#d7f34c] px-4 py-2 text-xs font-black uppercase tracking-wide text-[#123f2d]">
                      Активна ліга
                    </span>
                    <span className="text-sm font-bold text-white/60">
                      {formatTournamentDate(season.start_date)} —{" "}
                      {formatTournamentDate(season.end_date)}
                    </span>
                  </div>

                  <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#d7f34c]">
                    Тенісна ліга
                  </p>
                  <h2 className="mt-1.5 text-2xl font-black uppercase leading-tight">
                    {season.title}
                  </h2>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-white/50">
                        Учасників
                      </p>
                      <strong className="mt-1 block text-base">
                        {leagueParticipantCounts[season.id] ?? 0}
                      </strong>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-white/50">
                        Формат
                      </p>
                      <strong className="mt-1 block text-base">
                        Кожен з кожним
                      </strong>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
                    <span className="text-sm font-black">
                      Переглянути таблицю та матчі
                    </span>
                    <span className="text-2xl transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            {visibleTournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.slug}`}
                className="group rounded-[24px] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
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

                <h2 className="mt-5 text-2xl font-black uppercase leading-tight transition group-hover:text-[#ad4529]">
                  {tournament.title}
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-[#f6f0e5] p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#123f2d]/45">
                      Рівень
                    </p>

                    <strong className="mt-1 block text-base">
                      {formatLevel(
                        tournament.min_rating,
                        tournament.max_rating,
                      )}
                    </strong>
                  </div>

                  <div className="rounded-2xl bg-[#f6f0e5] p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#123f2d]/45">
                      Учасників
                    </p>

                    <strong className="mt-1 block text-base">
                      {participantCounts[tournament.id] ?? 0}
                    </strong>
                  </div>

                  <div className="rounded-2xl bg-[#f6f0e5] p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#123f2d]/45">
                      Місце
                    </p>

                    <strong className="mt-1 block text-base leading-tight">
                      {tournament.location || "Не вказано"}
                    </strong>
                  </div>

                  <div className="rounded-2xl bg-[#f6f0e5] p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#123f2d]/45">
                      Формат
                    </p>

                    <strong className="mt-1 block text-base leading-tight">
                      {formatTournamentFormat(tournament.format)}
                    </strong>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#123f2d]/10 pt-4">
                  <span className="text-sm font-black">
                    Переглянути результати
                  </span>

                  <span className="text-2xl transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {!showAll && filteredTournaments.length > 5 && (
            <div className="mt-8 text-center">
              <Link
                href={`/tournaments?tab=${selectedTab}&show=all`}
                className="inline-flex rounded-full bg-[#123f2d] px-7 py-3 font-black uppercase tracking-wide text-white transition hover:bg-[#ad4529]"
              >
                Показати всі ({filteredTournaments.length})
              </Link>
            </div>
          )}
          </>
        ) : (
          <div className="rounded-[30px] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-black">
              У цьому розділі поки немає турнірів
            </h2>

            <p className="mt-3 text-[#123f2d]/60">
              Оберіть іншу вкладку, щоб переглянути доступні турніри.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
