import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPlayers } from "@/lib/players/getPlayers";
import { isThirdSetTiebreak } from "@/lib/matches/tiebreak";
import PlayerFilterCombobox from "@/components/PlayerFilterCombobox";

export const metadata: Metadata = {
  title: "Останні матчі | Irpin Tennis",
  description:
    "Останні результати турнірів, тенісних ліг та рейтингових матчів Irpin Tennis.",
  alternates: { canonical: "/matches" },
};

type Player = {
  id: string;
  name: string;
  slug: string;
  rating: number;
  rank?: number;
};
type Competition = {
  id: string;
  title: string;
  slug: string;
  date?: string | null;
};
type RawMatch = {
  id: string;
  player1: Player | Player[] | null;
  player2: Player | Player[] | null;
  winner: Player | Player[] | null;
  player1_set1: number | null;
  player2_set1: number | null;
  player1_set2: number | null;
  player2_set2: number | null;
  player1_set3: number | null;
  player2_set3: number | null;
  notes?: string | null;
};
type RecentMatch = {
  id: string;
  type: "tournament" | "league" | "rating";
  competitionId: string;
  competitionTitle: string;
  competitionHref: string | null;
  date: string;
  player1: Player;
  player2: Player;
  winnerId: string | null;
  sets: Array<[number, number]>;
  thirdSetIsTiebreak: boolean;
};

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function buildSets(match: RawMatch) {
  return [
    [match.player1_set1, match.player2_set1],
    [match.player1_set2, match.player2_set2],
    [match.player1_set3, match.player2_set3],
  ].filter(
    (set): set is [number, number] =>
      typeof set[0] === "number" && typeof set[1] === "number",
  );
}

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function visibleCountOf(value: string | string[] | undefined) {
  const parsed = Number.parseInt(valueOf(value), 10);
  if (!Number.isFinite(parsed)) return 20;
  return Math.max(20, parsed);
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{
    player?: string | string[];
    competition?: string | string[];
    shown?: string | string[];
  }>;
}) {
  const filters = await searchParams;
  const selectedPlayer = valueOf(filters.player);
  const selectedCompetition = valueOf(filters.competition);
  const visibleCount = visibleCountOf(filters.shown);
  const [supabase, rankedPlayers] = await Promise.all([
    createClient(),
    getPlayers(),
  ]);

  const [
    { data: tournamentMatches, error: tournamentError },
    { data: leagueMatches, error: leagueError },
    { data: ratingMatches, error: ratingError },
    { data: playersData },
    { data: activeTournaments },
    { data: activeLeagueSeasons },
  ] = await Promise.all([
    supabase
      .from("matches")
      .select(`
        id, notes,
        player1_set1, player2_set1,
        player1_set2, player2_set2,
        player1_set3, player2_set3,
        player1:players!matches_player1_id_fkey (id, name, slug, rating),
        player2:players!matches_player2_id_fkey (id, name, slug, rating),
        winner:players!matches_winner_id_fkey (id, name, slug, rating),
        competition:tournaments!matches_tournament_id_fkey (
          id, title, slug, tournament_date
        )
      `)
      .eq("status", "finished"),
    supabase
      .from("league_matches")
      .select(`
        id, played_at, created_at, notes,
        player1_set1, player2_set1,
        player1_set2, player2_set2,
        player1_set3, player2_set3,
        player1:players!league_matches_player1_id_fkey (id, name, slug, rating),
        player2:players!league_matches_player2_id_fkey (id, name, slug, rating),
        winner:players!league_matches_winner_id_fkey (id, name, slug, rating),
        competition:league_seasons!league_matches_season_id_fkey (
          id, title, start_date
        )
      `),
    supabase
      .from("rating_matches")
      .select(`
        id, played_at, confirmed_at,
        player1_set1, player2_set1,
        player1_set2, player2_set2,
        player1_set3, player2_set3,
        player1:players!rating_matches_challenger_id_fkey (id, name, slug, rating),
        player2:players!rating_matches_opponent_id_fkey (id, name, slug, rating),
        winner:players!rating_matches_winner_id_fkey (id, name, slug, rating)
      `)
      .eq("status", "confirmed"),
    supabase
      .from("players")
      .select("id, name, slug, rating")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("tournaments")
      .select("id, title")
      .in("status", ["active", "live", "ongoing", "in_progress"]),
    supabase
      .from("league_seasons")
      .select("id, title")
      .eq("is_active", true),
  ]);

  if (tournamentError) console.error("Recent tournament matches:", tournamentError);
  if (leagueError) console.error("Recent league matches:", leagueError);
  if (ratingError) console.error("Recent rating matches:", ratingError);

  const playerRanks = new Map(
    rankedPlayers.map((player, index) => [player.id, index + 1]),
  );
  const withRank = (player: Player): Player => ({
    ...player,
    rank: playerRanks.get(player.id),
  });

  const recentMatches: RecentMatch[] = [];

  for (const row of tournamentMatches ?? []) {
    const match = row as unknown as RawMatch & {
      competition:
        | (Competition & { tournament_date: string })
        | Array<Competition & { tournament_date: string }>
        | null;
    };
    const rawPlayer1 = one(match.player1);
    const rawPlayer2 = one(match.player2);
    const competition = one(match.competition);
    if (!rawPlayer1 || !rawPlayer2 || !competition) continue;
    const player1 = withRank(rawPlayer1);
    const player2 = withRank(rawPlayer2);

    recentMatches.push({
      id: `tournament-${match.id}`,
      type: "tournament",
      competitionId: `tournament:${competition.id}`,
      competitionTitle: competition.title,
      competitionHref: `/tournaments/${competition.slug}`,
      date: competition.tournament_date,
      player1,
      player2,
      winnerId: one(match.winner)?.id ?? null,
      sets: buildSets(match),
      thirdSetIsTiebreak: isThirdSetTiebreak(match),
    });
  }

  for (const row of leagueMatches ?? []) {
    const match = row as unknown as RawMatch & {
      played_at: string | null;
      created_at: string;
      competition:
        | (Competition & { start_date: string })
        | Array<Competition & { start_date: string }>
        | null;
    };
    const rawPlayer1 = one(match.player1);
    const rawPlayer2 = one(match.player2);
    const competition = one(match.competition);
    if (!rawPlayer1 || !rawPlayer2 || !competition) continue;
    const player1 = withRank(rawPlayer1);
    const player2 = withRank(rawPlayer2);

    const leagueSlug = competition.title.toLowerCase().includes("challenger")
      ? "challenger"
      : competition.title.toLowerCase().includes("ladies")
        ? "ladies"
        : "masters";

    recentMatches.push({
      id: `league-${match.id}`,
      type: "league",
      competitionId: `league:${competition.id}`,
      competitionTitle: competition.title,
      competitionHref: `/league/${leagueSlug}`,
      date: match.played_at ?? match.created_at.slice(0, 10),
      player1,
      player2,
      winnerId: one(match.winner)?.id ?? null,
      sets: buildSets(match),
      thirdSetIsTiebreak: isThirdSetTiebreak(match),
    });
  }

  for (const row of ratingMatches ?? []) {
    const match = row as unknown as RawMatch & {
      played_at: string | null;
      confirmed_at: string | null;
    };
    const rawPlayer1 = one(match.player1);
    const rawPlayer2 = one(match.player2);
    if (!rawPlayer1 || !rawPlayer2) continue;
    const player1 = withRank(rawPlayer1);
    const player2 = withRank(rawPlayer2);

    recentMatches.push({
      id: `rating-${match.id}`,
      type: "rating",
      competitionId: "rating",
      competitionTitle: "Рейтинговий матч",
      competitionHref: "/rating",
      date: match.played_at ?? match.confirmed_at?.slice(0, 10) ?? "",
      player1,
      player2,
      winnerId: one(match.winner)?.id ?? null,
      sets: buildSets(match),
      thirdSetIsTiebreak: isThirdSetTiebreak(match),
    });
  }

  recentMatches.sort(
    (a, b) =>
      new Date(`${b.date}T12:00:00`).getTime() -
      new Date(`${a.date}T12:00:00`).getTime(),
  );

  const competitionOptions = [
    ...(activeTournaments ?? []).map((competition) => ({
      id: `tournament:${competition.id}`,
      title: competition.title,
      type: "tournament" as const,
    })),
    ...(activeLeagueSeasons ?? []).map((competition) => ({
      id: `league:${competition.id}`,
      title: competition.title,
      type: "league" as const,
    })),
  ].sort((a, b) => a.title.localeCompare(b.title, "uk"));

  const matchingMatches = recentMatches
    .filter(
      (match) =>
        !selectedPlayer ||
        match.player1.id === selectedPlayer ||
        match.player2.id === selectedPlayer,
    )
    .filter(
      (match) =>
        !selectedCompetition ||
        match.competitionId === selectedCompetition,
    );
  const filteredMatches = matchingMatches.slice(0, visibleCount);
  const hasMoreMatches = filteredMatches.length < matchingMatches.length;
  const nextPageParams = new URLSearchParams();
  if (selectedPlayer) nextPageParams.set("player", selectedPlayer);
  if (selectedCompetition) {
    nextPageParams.set("competition", selectedCompetition);
  }
  nextPageParams.set("shown", String(visibleCount + 20));

  return (
    <main className="min-h-screen bg-[#f7f1e7] text-[#123f2d]">
      <section className="border-b border-[#123f2d]/10 bg-[#123f2d] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#dce84c]">
            Результати Irpin Tennis
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase sm:text-6xl">
            Останні матчі
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
            Стежте за свіжими результатами турнірів, ліг та рейтингових
            поєдинків нашої спільноти.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          method="get"
          className="grid gap-4 rounded-[28px] bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end"
        >
          <PlayerFilterCombobox
            players={(playersData ?? []).map((player) => ({
              id: player.id,
              name: player.name,
            }))}
            selectedId={selectedPlayer}
          />

          <label className="grid gap-2 text-sm font-black uppercase tracking-wide">
            Ліга / турнір
            <select
              name="competition"
              defaultValue={selectedCompetition}
              className="min-w-0 rounded-2xl border border-[#123f2d]/15 bg-[#f7f1e7] px-4 py-3 text-base font-semibold normal-case outline-none focus:border-[#123f2d]"
            >
              <option value="">Усі змагання</option>
              {competitionOptions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.type === "league"
                    ? "Ліга · "
                    : competition.type === "tournament"
                      ? "Турнір · "
                      : ""}
                  {competition.title}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-[#bb5a3c] px-6 py-3 font-black uppercase text-white transition hover:bg-[#a94d33]"
            >
              Показати
            </button>
            {(selectedPlayer || selectedCompetition) && (
              <Link
                href="/matches"
                className="rounded-2xl border border-[#123f2d]/15 px-5 py-3 font-black"
              >
                Скинути
              </Link>
            )}
          </div>
        </form>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#bb5a3c]">
              Хронологія
            </p>
            <h2 className="mt-1 text-3xl font-black">
              Зіграні матчі · {matchingMatches.length}
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {hasMoreMatches && (
          <div className="mt-8 flex justify-center">
            <Link
              href={`/matches?${nextPageParams.toString()}`}
              scroll={false}
              className="rounded-2xl bg-[#123f2d] px-7 py-3.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#0d3224]"
            >
              Показати ще
            </Link>
          </div>
        )}

        {filteredMatches.length === 0 && (
          <div className="mt-5 rounded-[28px] bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-2xl font-black">Матчів за цими фільтрами немає</p>
            <p className="mt-2 text-[#123f2d]/55">
              Спробуйте вибрати іншого гравця або змагання.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function MatchCard({ match }: { match: RecentMatch }) {
  const date = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${match.date}T12:00:00`));

  return (
    <article className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {match.competitionHref ? (
          <Link
            href={match.competitionHref}
            className="text-xs font-black uppercase tracking-[0.14em] text-[#bb5a3c] hover:underline"
          >
            {match.competitionTitle}
          </Link>
        ) : (
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#bb5a3c]">
            {match.competitionTitle}
          </span>
        )}
        <time className="text-sm font-bold text-[#123f2d]/45">{date}</time>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3">
        <PlayerRow
          player={match.player1}
          winner={match.winnerId === match.player1.id}
        />
        <Scores
          scores={match.sets.map((set) => set[0])}
          thirdSetIsTiebreak={match.thirdSetIsTiebreak}
        />
        <PlayerRow
          player={match.player2}
          winner={match.winnerId === match.player2.id}
        />
        <Scores
          scores={match.sets.map((set) => set[1])}
          thirdSetIsTiebreak={match.thirdSetIsTiebreak}
        />
      </div>
    </article>
  );
}

function PlayerRow({ player, winner }: { player: Player; winner: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Link
        href={`/players/${player.slug}`}
        className={`min-w-0 flex-1 truncate text-base font-black transition hover:text-[#bb5a3c] sm:text-lg ${
          winner ? "text-[#123f2d]" : "text-[#123f2d]/65"
        }`}
      >
        {winner ? "🏆 " : ""}
        {player.name}
      </Link>
      <span
        className="shrink-0 rounded-lg bg-[#f7f1e7] px-2 py-1 text-xs font-black text-[#123f2d]"
        title={`Місце в загальному рейтингу: ${player.rank ?? "—"}`}
      >
        №{player.rank ?? "—"}
      </span>
    </div>
  );
}

function Scores({
  scores,
  thirdSetIsTiebreak,
}: {
  scores: number[];
  thirdSetIsTiebreak: boolean;
}) {
  return (
    <div className="flex gap-2">
      {scores.map((score, index) => (
        <span
          key={`${index}-${score}`}
          className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 font-black ${
            index === 2 && thirdSetIsTiebreak
              ? "border-2 border-[#123f2d] bg-[#f7f1e7] text-[#123f2d]"
              : "bg-[#123f2d] text-white"
          }`}
          title={
            index === 2 && thirdSetIsTiebreak
              ? "Матч-тайбрейк"
              : undefined
          }
        >
          {index === 2 && thirdSetIsTiebreak ? `[${score}]` : score}
        </span>
      ))}
    </div>
  );
}
