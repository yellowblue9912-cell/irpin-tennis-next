import HomePageClient, { type HomeRecentMatch } from "@/components/HomePageClient";
import { isThirdSetTiebreak } from "@/lib/matches/tiebreak";
import { createClient } from "@/lib/supabase/server";

type Player = { id: string; name: string; slug: string };
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

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function setsOf(match: RawMatch): Array<[number, number]> {
  return [
    [match.player1_set1, match.player2_set1],
    [match.player1_set2, match.player2_set2],
    [match.player1_set3, match.player2_set3],
  ].filter(
    (set): set is [number, number] =>
      typeof set[0] === "number" && typeof set[1] === "number",
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const [tournamentResult, leagueResult, ratingResult] = await Promise.all([
    supabase
      .from("matches")
      .select(`
        id, notes,
        player1_set1, player2_set1, player1_set2, player2_set2,
        player1_set3, player2_set3,
        player1:players!matches_player1_id_fkey (id, name, slug),
        player2:players!matches_player2_id_fkey (id, name, slug),
        winner:players!matches_winner_id_fkey (id, name, slug),
        competition:tournaments!matches_tournament_id_fkey (title, tournament_date)
      `)
      .eq("status", "finished"),
    supabase
      .from("league_matches")
      .select(`
        id, played_at, created_at, notes,
        player1_set1, player2_set1, player1_set2, player2_set2,
        player1_set3, player2_set3,
        player1:players!league_matches_player1_id_fkey (id, name, slug),
        player2:players!league_matches_player2_id_fkey (id, name, slug),
        winner:players!league_matches_winner_id_fkey (id, name, slug),
        competition:league_seasons!league_matches_season_id_fkey (title)
      `)
      .order("played_at", { ascending: false, nullsFirst: false })
      .limit(20),
    supabase
      .from("rating_matches")
      .select(`
        id, played_at, confirmed_at,
        player1_set1, player2_set1, player1_set2, player2_set2,
        player1_set3, player2_set3,
        player1:players!rating_matches_challenger_id_fkey (id, name, slug),
        player2:players!rating_matches_opponent_id_fkey (id, name, slug),
        winner:players!rating_matches_winner_id_fkey (id, name, slug)
      `)
      .eq("status", "confirmed")
      .order("played_at", { ascending: false, nullsFirst: false })
      .limit(20),
  ]);

  if (tournamentResult.error) console.error("Home tournament matches:", tournamentResult.error);
  if (leagueResult.error) console.error("Home league matches:", leagueResult.error);
  if (ratingResult.error) console.error("Home rating matches:", ratingResult.error);

  const matches: HomeRecentMatch[] = [];
  const addMatch = (
    row: RawMatch,
    competition: string,
    date: string,
    prefix: string,
  ) => {
    const player1 = one(row.player1);
    const player2 = one(row.player2);
    if (!player1 || !player2 || !date) return;
    matches.push({
      id: `${prefix}-${row.id}`,
      competition,
      date,
      player1,
      player2,
      player1Id: player1.id,
      player2Id: player2.id,
      winnerId: one(row.winner)?.id ?? null,
      sets: setsOf(row),
      thirdSetIsTiebreak: isThirdSetTiebreak(row),
    });
  };

  for (const raw of tournamentResult.data ?? []) {
    const row = raw as unknown as RawMatch & {
      competition: { title: string; tournament_date: string } | Array<{ title: string; tournament_date: string }> | null;
    };
    const competition = one(row.competition);
    if (competition) addMatch(row, competition.title, competition.tournament_date, "tournament");
  }

  for (const raw of leagueResult.data ?? []) {
    const row = raw as unknown as RawMatch & {
      played_at: string | null;
      created_at: string;
      competition: { title: string } | Array<{ title: string }> | null;
    };
    const competition = one(row.competition);
    if (competition) addMatch(row, competition.title, row.played_at ?? row.created_at.slice(0, 10), "league");
  }

  for (const raw of ratingResult.data ?? []) {
    const row = raw as unknown as RawMatch & { played_at: string | null; confirmed_at: string | null };
    addMatch(row, "Рейтинговий матч", row.played_at ?? row.confirmed_at?.slice(0, 10) ?? "", "rating");
  }

  matches.sort((a, b) => b.date.localeCompare(a.date));

  return <HomePageClient recentMatches={matches.slice(0, 6)} />;
}
