import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { MatchActions } from "./MatchActions";

export const dynamic = "force-dynamic";

type Relation = { name?: string; title?: string; tournament_date?: string | null };
type MatchSource = {
  id: string;
  played_at?: string | null;
  confirmed_at?: string | null;
  created_at: string;
  player1_set1: number | null;
  player2_set1: number | null;
  player1_set2: number | null;
  player2_set2: number | null;
  player1_set3: number | null;
  player2_set3: number | null;
  player1: Relation | Relation[] | null;
  player2: Relation | Relation[] | null;
  winner: Relation | Relation[] | null;
  competition?: Relation | Relation[] | null;
};
type AdminRecentMatch = {
  id: string;
  sourceId: string;
  type: "league" | "rating" | "tournament";
  title: string;
  date: string;
  sortDate: string;
  player1: string;
  player2: string;
  winner: string;
  score: string;
  scores: Array<[number | null, number | null]>;
};

export default async function AdminMatchesPage() {
  const supabase = createAdminSupabaseClient();
  const [leagueResult, ratingResult, tournamentResult] = await Promise.all([
    supabase
      .from("league_matches")
      .select(`
        id, played_at, created_at,
        player1_set1, player2_set1, player1_set2, player2_set2,
        player1_set3, player2_set3,
        player1:players!league_matches_player1_id_fkey(name),
        player2:players!league_matches_player2_id_fkey(name),
        winner:players!league_matches_winner_id_fkey(name),
        competition:league_seasons!league_matches_season_id_fkey(title)
      `)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("rating_matches")
      .select(`
        id, played_at, confirmed_at, created_at,
        player1_set1, player2_set1, player1_set2, player2_set2,
        player1_set3, player2_set3,
        player1:players!rating_matches_challenger_id_fkey(name),
        player2:players!rating_matches_opponent_id_fkey(name),
        winner:players!rating_matches_winner_id_fkey(name)
      `)
      .eq("status", "confirmed")
      .order("confirmed_at", { ascending: false })
      .limit(20),
    supabase
      .from("matches")
      .select(`
        id, created_at,
        player1_set1, player2_set1, player1_set2, player2_set2,
        player1_set3, player2_set3,
        player1:players!matches_player1_id_fkey(name),
        player2:players!matches_player2_id_fkey(name),
        winner:players!matches_winner_id_fkey(name),
        competition:tournaments!matches_tournament_id_fkey(title, tournament_date)
      `)
      .eq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const queryError =
    leagueResult.error ?? ratingResult.error ?? tournamentResult.error;
  if (queryError) {
    throw new Error(`Не вдалося завантажити матчі: ${queryError.message}`);
  }

  const matches: AdminRecentMatch[] = [
    ...((leagueResult.data ?? []) as unknown as MatchSource[]).map((match) =>
      normalizeMatch(match, "league"),
    ),
    ...((ratingResult.data ?? []) as unknown as MatchSource[]).map((match) =>
      normalizeMatch(match, "rating"),
    ),
    ...((tournamentResult.data ?? []) as unknown as MatchSource[]).map((match) =>
      normalizeMatch(match, "tournament"),
    ),
  ]
    .sort((left, right) => right.sortDate.localeCompare(left.sortDate))
    .slice(0, 20);

  return (
    <main>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
          Результати
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase text-[#123f2d]">
          Матчі
        </h1>
        <p className="mt-3 max-w-3xl text-[#123f2d]/55">
          Тут показані останні матчі ліг, турнірів і рейтингові матчі.
          Помилковий матч ліги можна видалити з автоматичним перерахунком
          таблиці та рейтингу.
        </p>
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <Link
          href="/admin/matches/league/new"
          className="group rounded-[28px] bg-[#123f2d] p-7 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          style={{ color: "#ffffff" }}
        >
          <span className="text-4xl">🎾</span>
          <h2 className="mt-6 text-2xl font-black uppercase">Матч ліги</h2>
          <p className="mt-3 leading-7 text-white/65">
            Оберіть сезон і двох учасників, внесіть дату та рахунок.
          </p>
          <span className="mt-7 block font-black text-[#d7f34c]">
            Внести результат →
          </span>
        </Link>

        <Link
          href="/admin/tournaments/new"
          className="group rounded-[28px] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="text-4xl">🏆</span>
          <h2 className="mt-6 text-2xl font-black uppercase text-[#123f2d]">
            Новий турнір
          </h2>
          <p className="mt-3 leading-7 text-[#123f2d]/55">
            Створіть турнір, додайте учасників і внесіть результати.
          </p>
          <span className="mt-7 block font-black text-[#ad4529]">
            Створити турнір →
          </span>
        </Link>
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
            Останні записи
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#123f2d]">
            Останні 20 матчів
          </h2>
        </div>

        <div className="space-y-3">
          {matches.map((match) => (
            <article
              key={match.id}
              className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#ad4529]">
                  {match.title} · {formatDate(match.date)}
                </p>
                <p className="mt-2 text-lg font-black text-[#123f2d]">
                  {match.player1} — {match.player2}
                </p>
                <p className="mt-1 text-sm text-[#123f2d]/60">
                  Рахунок: {match.score || "—"} · Переможець: {match.winner}
                </p>
              </div>

              <MatchActions id={match.sourceId} type={match.type} player1={match.player1} player2={match.player2} scores={match.scores} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function normalizeMatch(
  match: MatchSource,
  type: AdminRecentMatch["type"],
): AdminRecentMatch {
  const competition = one(match.competition);
  const date =
    type === "tournament"
      ? competition?.tournament_date ?? match.created_at.slice(0, 10)
      : match.played_at ?? match.confirmed_at?.slice(0, 10) ?? match.created_at.slice(0, 10);
  const sortDate =
    type === "rating"
      ? match.confirmed_at ?? match.created_at
      : `${date}T12:00:00`;
  const labels = {
    league: competition?.title ?? "Матч ліги",
    rating: "Рейтинговий матч",
    tournament: competition?.title ?? "Турнірний матч",
  };

  return {
    id: `${type}-${match.id}`,
    sourceId: match.id,
    type,
    title: labels[type],
    date,
    sortDate,
    player1: one(match.player1)?.name ?? "Гравець 1",
    player2: one(match.player2)?.name ?? "Гравець 2",
    winner: one(match.winner)?.name ?? "—",
    score: buildScore(match),
    scores: [[match.player1_set1, match.player2_set1], [match.player1_set2, match.player2_set2], [match.player1_set3, match.player2_set3]],
  };
}

function buildScore(match: MatchSource) {
  return [
    [match.player1_set1, match.player2_set1],
    [match.player1_set2, match.player2_set2],
    [match.player1_set3, match.player2_set3],
  ]
    .filter(([left, right]) => left !== null && right !== null)
    .map(([left, right]) => `${left}:${right}`)
    .join(", ");
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA").format(new Date(`${value}T12:00:00`));
}
