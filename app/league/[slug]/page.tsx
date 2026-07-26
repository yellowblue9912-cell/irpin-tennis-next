import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Player = {
  id: string;
  name: string;
  slug: string;
};

type StandingRowFromDatabase = {
  id: string;
  player_id: string;
  matches_played: number;
  wins: number;
  losses: number;
  sets_difference: number;
  games_difference: number;
  points: number;
};

type StandingRow = StandingRowFromDatabase & {
  player: Player;
};

type LeagueMatchFromDatabase = {
  id: string;
  played_at: string | null;
  notes: string | null;
  created_at: string;

  player1_set1: number | null;
  player2_set1: number | null;

  player1_set2: number | null;
  player2_set2: number | null;

  player1_set3: number | null;
  player2_set3: number | null;

  player1: Player | Player[] | null;
  player2: Player | Player[] | null;
  winner: Player | Player[] | null;
};

type LeagueSeason = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

const leagueConfiguration: Record<
  string,
  {
    seasonTitle: string;
    pageTitle: string;
    shortTitle: string;
  }
> = {
  masters: {
    seasonTitle: "ITL Masters — Season 1",
    pageTitle: "ITL Masters",
    shortTitle: "Masters",
  },

  challenger: {
    seasonTitle: "ITL Challenger — Season 1",
    pageTitle: "ITL Challenger",
    shortTitle: "Challenger",
  },

  ladies: {
    seasonTitle: "ITL Ladies — Season 1",
    pageTitle: "ITL Ladies",
    shortTitle: "Ladies",
  },
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const configuration = leagueConfiguration[slug];

  if (!configuration) {
    return {
      title: "Тенісна ліга | Irpin Tennis",
      robots: { index: false, follow: false },
    };
  }

  const description = `${configuration.seasonTitle}: турнірна таблиця, учасники, зіграні матчі, результати та прогрес активного сезону Irpin Tennis.`;

  return {
    title: `${configuration.seasonTitle} — таблиця і матчі | Irpin Tennis`,
    description,
    alternates: { canonical: `/league/${slug}` },
    openGraph: {
      title: configuration.seasonTitle,
      description,
      url: `/league/${slug}`,
      type: "website",
    },
  };
}

function normalizePlayer(
  player: Player | Player[] | null | undefined,
): Player | null {
  if (!player) {
    return null;
  }

  if (Array.isArray(player)) {
    return player[0] ?? null;
  }

  return player;
}

function formatDate(date: string | null): string {
  if (!date) {
    return "Дата не вказана";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatDifference(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

function getDifferenceClass(value: number): string {
  if (value > 0) {
    return "font-semibold text-emerald-700";
  }

  if (value < 0) {
    return "font-semibold text-red-600";
  }

  return "font-semibold text-slate-600";
}

function getPositionClass(position: number): string {
  if (position === 1) {
    return "bg-amber-100 text-amber-800";
  }

  if (position === 2) {
    return "bg-slate-200 text-slate-700";
  }

  if (position === 3) {
    return "bg-orange-100 text-orange-800";
  }

  return "bg-slate-100 text-slate-600";
}

function getPositionIcon(position: number): string {
  if (position === 1) {
    return "🥇";
  }

  if (position === 2) {
    return "🥈";
  }

  if (position === 3) {
    return "🥉";
  }

  return String(position);
}

function buildSets(match: LeagueMatchFromDatabase) {
  const sets = [
    {
      player1: match.player1_set1,
      player2: match.player2_set1,
    },
    {
      player1: match.player1_set2,
      player2: match.player2_set2,
    },
    {
      player1: match.player1_set3,
      player2: match.player2_set3,
    },
  ];

  return sets.filter(
    (set) => set.player1 !== null && set.player2 !== null,
  );
}

function getSeasonTimeProgress(startDate: string, endDate: string) {
  const dayMs = 24 * 60 * 60 * 1000;
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  const now = new Date();
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return { percentage: 0, label: "Дати сезону не вказані" };
  }

  if (today < start) {
    const days = Math.ceil((start - today) / dayMs);
    return {
      percentage: 0,
      label: `До початку: ${days} ${dayWord(days)}`,
    };
  }

  if (today >= end) {
    return { percentage: 100, label: "Сезон завершено" };
  }

  const percentage = Math.round(((today - start) / (end - start)) * 100);
  const days = Math.ceil((end - today) / dayMs);

  return {
    percentage,
    label: `До завершення: ${days} ${dayWord(days)}`,
  };
}

function dayWord(days: number) {
  const lastTwo = days % 100;
  const last = days % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "днів";
  if (last === 1) return "день";
  if (last >= 2 && last <= 4) return "дні";
  return "днів";
}

export default async function LeaguePage({ params }: PageProps) {
  const { slug } = await params;

  const configuration = leagueConfiguration[slug];

  if (!configuration) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: seasonData,
    error: seasonError,
  } = await supabase
    .from("league_seasons")
    .select(
      `
        id,
        title,
        description,
        start_date,
        end_date,
        is_active
      `,
    )
    .eq("title", configuration.seasonTitle)
    .maybeSingle();

  if (seasonError) {
    console.error("Помилка завантаження сезону:", seasonError);
  }

  if (!seasonData) {
    notFound();
  }

  const season = seasonData as LeagueSeason;

  const [
    { data: leaguePlayersData, error: leaguePlayersError },
    { data: playersData, error: playersError },
    { data: matchesData, error: matchesError },
  ] = await Promise.all([
    supabase
      .from("league_players")
      .select(
        `
          id,
          player_id,
          matches_played,
          wins,
          losses,
          sets_difference,
          games_difference,
          points
        `,
      )
      .eq("season_id", season.id),

    supabase
      .from("players")
      .select(
        `
          id,
          name,
          slug
        `,
      ),

    supabase
      .from("league_matches")
      .select(
        `
          id,
          played_at,
          notes,
          created_at,

          player1_set1,
          player2_set1,

          player1_set2,
          player2_set2,

          player1_set3,
          player2_set3,

          player1:players!league_matches_player1_id_fkey (
            id,
            name,
            slug
          ),

          player2:players!league_matches_player2_id_fkey (
            id,
            name,
            slug
          ),

          winner:players!league_matches_winner_id_fkey (
            id,
            name,
            slug
          )
        `,
      )
      .eq("season_id", season.id)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (leaguePlayersError) {
    console.error(
      "Помилка завантаження учасників ліги:",
      leaguePlayersError,
    );
  }

  if (playersError) {
    console.error(
      "Помилка завантаження гравців:",
      playersError,
    );
  }

  if (matchesError) {
    console.error("Помилка завантаження матчів:", matchesError);
  }

  const players = (playersData ?? []) as Player[];

  const playersMap = new Map<string, Player>(
    players.map((player) => [player.id, player]),
  );

  const standings: StandingRow[] = (
    (leaguePlayersData ?? []) as StandingRowFromDatabase[]
  )
    .map((row) => {
      const player = playersMap.get(row.player_id);

      if (!player) {
        return null;
      }

      return {
        ...row,
        player,
      };
    })
    .filter((row): row is StandingRow => row !== null)
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.sets_difference !== a.sets_difference) {
        return b.sets_difference - a.sets_difference;
      }

      if (b.games_difference !== a.games_difference) {
        return b.games_difference - a.games_difference;
      }

      return a.player.name.localeCompare(
        b.player.name,
        "uk-UA",
      );
    });

  const matches = (
    (matchesData ?? []) as unknown as LeagueMatchFromDatabase[]
  )
    .map((match) => ({
      ...match,
      player1: normalizePlayer(match.player1),
      player2: normalizePlayer(match.player2),
      winner: normalizePlayer(match.winner),
    }))
    .filter(
      (
        match,
      ): match is Omit<
        LeagueMatchFromDatabase,
        "player1" | "player2" | "winner"
      > & {
        player1: Player;
        player2: Player;
        winner: Player;
      } =>
        Boolean(match.player1) &&
        Boolean(match.player2) &&
        Boolean(match.winner),
    );

  const seasonProgress = getSeasonTimeProgress(
    season.start_date,
    season.end_date,
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <Link
            href="/league"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <span aria-hidden="true">←</span>
            Усі ліги
          </Link>
        </div>

        <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl sm:rounded-3xl">
          <div className="relative px-4 py-5 sm:px-10 sm:py-10">
            <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="relative">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Season 1
                </span>

                {season.is_active ? (
                  <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Активний сезон
                  </span>
                ) : (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                    Сезон завершено
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                {configuration.pageTitle}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                {season.description ??
                  "Тенісна ліга у форматі кожен грає з кожним."}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Тривалість сезону
                  </p>

                  <p className="mt-2 font-bold text-white">
                    {formatDate(season.start_date)} —{" "}
                    {formatDate(season.end_date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Учасників
                  </p>

                  <p className="mt-2 text-2xl font-black text-white">
                    {standings.length}
                  </p>
                </div>

              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>{seasonProgress.label}</span>
                  <span>{seasonProgress.percentage}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{
                      width: `${seasonProgress.percentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                Рейтинг
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                Турнірна таблиця
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-500">
              Перемога — 2 бали, поразка — 1 бал. При рівності балів
              враховується різниця сетів, а потім різниця геймів.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {standings.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-slate-700">
                  Учасників поки немає
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Додайте гравців до цього сезону в таблицю
                  league_players.
                </p>
              </div>
            ) : (
              <>
                <p className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-500 md:hidden">
                  М — матчі · В — перемоги · П — поразки
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-collapse md:min-w-[850px] md:table-auto">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="w-11 px-1.5 py-3 text-center sm:w-16 sm:px-3 md:w-20 md:px-5 md:py-4">
                          Місце
                        </th>

                        <th className="w-auto px-1.5 py-3 sm:px-3 md:px-5 md:py-4">
                          Гравець
                        </th>

                        <th className="w-8 px-0.5 py-3 text-center sm:w-10 sm:px-1 md:px-3 md:py-4">
                          М
                        </th>

                        <th className="w-8 px-0.5 py-3 text-center sm:w-10 sm:px-1 md:px-3 md:py-4">
                          В
                        </th>

                        <th className="w-8 px-0.5 py-3 text-center sm:w-10 sm:px-1 md:px-3 md:py-4">
                          П
                        </th>

                        <th className="hidden px-3 py-4 text-center md:table-cell">
                          Сети
                        </th>

                        <th className="hidden px-3 py-4 text-center md:table-cell">
                          Гейми
                        </th>

                        <th className="w-12 px-1 py-3 text-center sm:w-16 sm:px-2 md:px-5 md:py-4">
                          Бали
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {standings.map((row, index) => {
                        const position = index + 1;

                        return (
                          <tr
                            key={row.id}
                            className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                          >
                            <td className="px-1.5 py-3 text-center sm:px-3 md:px-5 md:py-4">
                              <span
                                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-black sm:h-8 sm:min-w-8 md:h-9 md:min-w-9 md:px-2 md:text-sm ${getPositionClass(
                                  position,
                                )}`}
                              >
                                {getPositionIcon(position)}
                              </span>
                            </td>

                            <td className="min-w-0 px-1.5 py-3 sm:px-3 md:px-5 md:py-4">
                              <Link
                                href={`/players/${row.player.slug}`}
                                className="block truncate text-xs font-bold leading-tight text-slate-900 transition hover:text-emerald-700 sm:text-sm md:text-base"
                              >
                                {row.player.name}
                              </Link>
                            </td>

                            <td className="px-0.5 py-3 text-center text-xs font-semibold text-slate-700 sm:px-1 sm:text-sm md:px-3 md:py-4 md:text-base">
                              {row.matches_played}
                            </td>

                            <td className="px-0.5 py-3 text-center text-xs font-semibold text-emerald-700 sm:px-1 sm:text-sm md:px-3 md:py-4 md:text-base">
                              {row.wins}
                            </td>

                            <td className="px-0.5 py-3 text-center text-xs font-semibold text-red-600 sm:px-1 sm:text-sm md:px-3 md:py-4 md:text-base">
                              {row.losses}
                            </td>

                            <td
                              className={`hidden px-3 py-4 text-center md:table-cell ${getDifferenceClass(
                                row.sets_difference,
                              )}`}
                            >
                              {formatDifference(
                                row.sets_difference,
                              )}
                            </td>

                            <td
                              className={`hidden px-3 py-4 text-center md:table-cell ${getDifferenceClass(
                                row.games_difference,
                              )}`}
                            >
                              {formatDifference(
                                row.games_difference,
                              )}
                            </td>

                            <td className="px-1 py-3 text-center sm:px-2 md:px-5 md:py-4">
                              <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-slate-950 px-1.5 py-1.5 text-xs font-black text-white sm:min-w-10 sm:px-2 sm:text-sm md:min-w-11 md:rounded-xl md:px-3 md:py-2">
                                {row.points}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="hidden">
                  {standings.map((row, index) => {
                    const position = index + 1;

                    return (
                      <article
                        key={row.id}
                        className="p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-2 text-sm font-black ${getPositionClass(
                              position,
                            )}`}
                          >
                            {getPositionIcon(position)}
                          </span>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/players/${row.player.slug}`}
                              className="block truncate font-bold text-slate-950"
                            >
                              {row.player.name}
                            </Link>

                            <p className="mt-1 text-xs text-slate-500">
                              {row.matches_played} матчів ·{" "}
                              {row.wins} перемог ·{" "}
                              {row.losses} поразок
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-950 px-3 py-2 text-center text-white">
                            <p className="text-lg font-black leading-none">
                              {row.points}
                            </p>

                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Бали
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-xl bg-slate-50 p-3 text-center">
                            <p className="text-xs font-semibold text-slate-500">
                              Різниця сетів
                            </p>

                            <p
                              className={`mt-1 ${getDifferenceClass(
                                row.sets_difference,
                              )}`}
                            >
                              {formatDifference(
                                row.sets_difference,
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3 text-center">
                            <p className="text-xs font-semibold text-slate-500">
                              Різниця геймів
                            </p>

                            <p
                              className={`mt-1 ${getDifferenceClass(
                                row.games_difference,
                              )}`}
                            >
                              {formatDifference(
                                row.games_difference,
                              )}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4">
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
              Результати
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
              Зіграні матчі
            </h2>
          </div>

          {matches.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-bold text-slate-800">
                Зіграних матчів поки немає
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Після додавання результатів вони з’являться тут
                автоматично.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {matches.map((match) => {
                const sets = buildSets(match);

                const player1Won =
                  match.winner.id === match.player1.id;

                const player2Won =
                  match.winner.id === match.player2.id;

                return (
                  <article
                    key={match.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        ITL {configuration.shortTitle}
                      </span>

                      <span className="text-xs font-semibold text-slate-500">
                        {match.played_at
                          ? formatDate(match.played_at)
                          : "Дата не вказана"}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3">
                        <Link
                          href={`/players/${match.player1.slug}`}
                          className={`truncate text-base transition hover:text-emerald-700 ${
                            player1Won
                              ? "font-black text-slate-950"
                              : "font-semibold text-slate-600"
                          }`}
                        >
                          {player1Won && (
                            <span
                              className="mr-2"
                              aria-label="Переможець"
                            >
                              🏆
                            </span>
                          )}

                          {match.player1.name}
                        </Link>

                        <div className="flex gap-2">
                          {sets.map((set, index) => {
                            const setWon =
                              Number(set.player1) >
                              Number(set.player2);

                            return (
                              <span
                                key={`player1-${index}`}
                                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-black ${
                                  setWon
                                    ? "bg-slate-950 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {set.player1}
                              </span>
                            );
                          })}
                        </div>

                        <Link
                          href={`/players/${match.player2.slug}`}
                          className={`truncate text-base transition hover:text-emerald-700 ${
                            player2Won
                              ? "font-black text-slate-950"
                              : "font-semibold text-slate-600"
                          }`}
                        >
                          {player2Won && (
                            <span
                              className="mr-2"
                              aria-label="Переможець"
                            >
                              🏆
                            </span>
                          )}

                          {match.player2.name}
                        </Link>

                        <div className="flex gap-2">
                          {sets.map((set, index) => {
                            const setWon =
                              Number(set.player2) >
                              Number(set.player1);

                            return (
                              <span
                                key={`player2-${index}`}
                                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-black ${
                                  setWon
                                    ? "bg-slate-950 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {set.player2}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {match.notes && (
                        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          {match.notes}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
