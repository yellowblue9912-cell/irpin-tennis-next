import { createClient } from "../supabase/server";
import { getPlayerName, getPlayerPhoto } from "./getPlayerPhoto";
import { decodePlayerSlug } from "./decodePlayerSlug";
import { isThirdSetTiebreak } from "../matches/tiebreak";

export type ProfilePlayer = {
  id: string;
  name: string;
  slug: string;
  rating: number;
  rating_base: number;
  photo_url: string | null;
  city: string | null;
  bio: string | null;
  phone: string | null;
  birth_date: string | null;
  tennis_experience_years: number | null;
  phone_public: boolean;
  is_active: boolean;
};

export type ProfileTournament = {
  id: string;
  title: string;
  slug: string;
  href: string;
  type: "tournament" | "league";
  tournament_date: string;
  location: string | null;
  place: number | null;
  wins: number;
  losses: number;
  games_won: number;
  games_lost: number;
  game_difference: number;
};

export type ProfileMatch = {
  id: string;
  tournament_id: string;
  tournament_title: string;
  tournament_date: string;
  opponent_id: string;
  opponent_name: string;
  opponent_slug: string;
  player_set1: number | null;
  opponent_set1: number | null;
  player_set2: number | null;
  opponent_set2: number | null;
  player_set3: number | null;
  opponent_set3: number | null;
  third_set_is_tiebreak: boolean;
  is_winner: boolean;
  status: string;
  rating_before: number | null;
  rating_after: number | null;
  rating_change: number | null;
  opponent_rating_before: number | null;
  rating_event_date: string | null;
  rating_created_at: string | null;
};

export type PlayerProfileData = {
  player: ProfilePlayer;
  tournaments: ProfileTournament[];
  matches: ProfileMatch[];
  stats: {
    tournaments: number;
    matches: number;
    wins: number;
    losses: number;
    winRate: number;
    titles: number;
    podiums: number;
  };
};

type PlacementRow = {
  tournament_id: string;
  place: number | null;
  wins: number | null;
  losses: number | null;
  games_won: number | null;
  games_lost: number | null;
  game_difference: number | null;
};

type MatchRow = {
  id: string;
  tournament_id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string | null;
  player1_set1: number | null;
  player2_set1: number | null;
  player1_set2: number | null;
  player2_set2: number | null;
  player1_set3: number | null;
  player2_set3: number | null;
  notes: string | null;
  status: string;
};

type LeagueMatchRow = {
  id: string;
  season_id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string | null;
  player1_set1: number | null;
  player2_set1: number | null;
  player1_set2: number | null;
  player2_set2: number | null;
  player1_set3: number | null;
  player2_set3: number | null;
  notes: string | null;
  played_at: string | null;
  created_at: string;
};

type RatingMatchRow = {
  id: string;
  challenger_id: string;
  opponent_id: string;
  winner_id: string;
  player1_set1: number | null;
  player2_set1: number | null;
  player1_set2: number | null;
  player2_set2: number | null;
  player1_set3: number | null;
  player2_set3: number | null;
  played_at: string;
};

type TournamentRow = {
  id: string;
  title: string;
  slug: string;
  tournament_date: string;
  location: string | null;
};

type LeagueSeasonRow = {
  id: string;
  title: string;
  start_date: string;
};

type LeaguePlayerRow = {
  season_id: string;
  matches_played: number;
  wins: number;
  losses: number;
  sets_difference: number;
  games_difference: number;
  points: number;
};

type OpponentRow = {
  id: string;
  name: string;
  slug: string;
};

type RatingHistoryRow = {
  player_id: string;
  opponent_id: string;
  source_type: "tournament" | "league" | "rating_match";
  source_match_id: string;
  rating_before: number;
  rating_after: number;
  rating_change: number;
  event_date: string;
  created_at: string;
};

export async function getPlayerProfile(
  slug: string,
): Promise<PlayerProfileData | null> {
  const supabase = await createClient();
  const decodedSlug = decodePlayerSlug(slug);

  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("id, name, slug, rating, rating_base, photo_url, city, bio, is_active")
    .eq("slug", decodedSlug)
    .single();

  if (playerError || !playerData) {
    console.error("Player profile loading error:", playerError);
    return null;
  }

  const { data: publicContacts } = await supabase
    .from("public_player_contacts")
    .select("phone, birth_date, tennis_experience_years, phone_public")
    .eq("player_id", playerData.id)
    .maybeSingle();

  const player = {
    ...playerData,
    name: getPlayerName(playerData.slug, playerData.name),
    photo_url: getPlayerPhoto(playerData.slug, playerData.photo_url),
    phone: publicContacts?.phone ?? null,
    birth_date: publicContacts?.birth_date ?? null,
    tennis_experience_years:
      publicContacts?.tennis_experience_years ?? null,
    phone_public: publicContacts?.phone_public ?? false,
  } as ProfilePlayer;

  const [
    { data: placementsData, error: placementsError },
    { data: matchesData, error: matchesError },
    { data: leagueMatchesData, error: leagueMatchesError },
    { data: leaguePlayersData, error: leaguePlayersError },
    { data: ratingMatchesData, error: ratingMatchesError },
  ] = await Promise.all([
    supabase
      .from("tournament_placements")
      .select(
        `
          tournament_id,
          place,
          wins,
          losses,
          games_won,
          games_lost,
          game_difference
        `,
      )
      .eq("player_id", player.id),

    supabase
      .from("matches")
      .select(
        `
          id,
          tournament_id,
          player1_id,
          player2_id,
          winner_id,
          player1_set1,
          player2_set1,
          player1_set2,
          player2_set2,
          player1_set3,
          player2_set3,
          notes,
          status
        `,
      )
      .or(`player1_id.eq.${player.id},player2_id.eq.${player.id}`)
      .eq("status", "finished")
      .not("winner_id", "is", null),

    supabase
      .from("league_matches")
      .select(
        `
          id,
          season_id,
          player1_id,
          player2_id,
          winner_id,
          player1_set1,
          player2_set1,
          player1_set2,
          player2_set2,
          player1_set3,
          player2_set3,
          notes,
          played_at,
          created_at
        `,
      )
      .or(`player1_id.eq.${player.id},player2_id.eq.${player.id}`),

    supabase
      .from("league_players")
      .select(
        `
          season_id,
          matches_played,
          wins,
          losses,
          sets_difference,
          games_difference,
          points
        `,
      )
      .eq("player_id", player.id),

    supabase
      .from("rating_matches")
      .select(
        `
          id,
          challenger_id,
          opponent_id,
          winner_id,
          player1_set1,
          player2_set1,
          player1_set2,
          player2_set2,
          player1_set3,
          player2_set3,
          played_at
        `,
      )
      .eq("status", "confirmed")
      .or(
        `challenger_id.eq.${player.id},opponent_id.eq.${player.id}`,
      ),
  ]);

  if (placementsError) {
    console.error("Player placements loading error:", placementsError);
  }

  if (matchesError) {
    console.error("Player matches loading error:", matchesError);
  }

  if (leagueMatchesError) {
    console.error(
      "Player league matches loading error:",
      leagueMatchesError,
    );
  }

  if (leaguePlayersError) {
    console.error(
      "Player league participation loading error:",
      leaguePlayersError,
    );
  }

  if (ratingMatchesError) {
    console.error(
      "Player rating matches loading error:",
      ratingMatchesError,
    );
  }

  const placements = (placementsData ?? []) as PlacementRow[];
  const matches = (matchesData ?? []) as MatchRow[];
  const leagueMatches = (leagueMatchesData ?? []) as LeagueMatchRow[];
  const leaguePlayers = (leaguePlayersData ?? []) as LeaguePlayerRow[];
  const ratingMatches = (ratingMatchesData ?? []) as RatingMatchRow[];

  const tournamentIds = Array.from(
    new Set([
      ...placements.map((placement) => placement.tournament_id),
      ...matches.map((match) => match.tournament_id),
    ]),
  );

  const leagueSeasonIds = Array.from(
    new Set([
      ...leagueMatches.map((match) => match.season_id),
      ...leaguePlayers.map((row) => row.season_id),
    ]),
  );

  const opponentIds = Array.from(
    new Set([
      ...matches.map((match) =>
        match.player1_id === player.id
          ? match.player2_id
          : match.player1_id,
      ),
      ...leagueMatches.map((match) =>
        match.player1_id === player.id
          ? match.player2_id
          : match.player1_id,
      ),
      ...ratingMatches.map((match) =>
        match.challenger_id === player.id
          ? match.opponent_id
          : match.challenger_id,
      ),
    ]),
  );

  let tournamentsMap = new Map<string, TournamentRow>();
  let leagueSeasonsMap = new Map<string, LeagueSeasonRow>();
  let opponentsMap = new Map<string, OpponentRow>();
  let playerRatingHistory: RatingHistoryRow[] = [];
  let opponentRatingHistory: RatingHistoryRow[] = [];

  if (tournamentIds.length > 0) {
    const { data: tournamentsData, error: tournamentsError } =
      await supabase
        .from("tournaments")
        .select("id, title, slug, tournament_date, location")
        .in("id", tournamentIds);

    if (tournamentsError) {
      console.error(
        "Profile tournaments loading error:",
        tournamentsError,
      );
    }

    tournamentsMap = new Map(
      ((tournamentsData ?? []) as TournamentRow[]).map(
        (tournament) => [tournament.id, tournament],
      ),
    );
  }

  if (leagueSeasonIds.length > 0) {
    const { data: leagueSeasonsData, error: leagueSeasonsError } =
      await supabase
        .from("league_seasons")
        .select("id, title, start_date")
        .in("id", leagueSeasonIds);

    if (leagueSeasonsError) {
      console.error(
        "Profile league seasons loading error:",
        leagueSeasonsError,
      );
    }

    leagueSeasonsMap = new Map(
      ((leagueSeasonsData ?? []) as LeagueSeasonRow[]).map(
        (season) => [season.id, season],
      ),
    );
  }

  if (opponentIds.length > 0) {
    const { data: opponentsData, error: opponentsError } =
      await supabase
        .from("players")
        .select("id, name, slug")
        .in("id", opponentIds);

    if (opponentsError) {
      console.error(
        "Profile opponents loading error:",
        opponentsError,
      );
    }

    opponentsMap = new Map(
      ((opponentsData ?? []) as OpponentRow[]).map(
        (opponent) => [opponent.id, opponent],
      ),
    );
  }

  const { data: playerRatingHistoryData, error: ratingHistoryError } =
    await supabase
      .from("player_rating_history")
      .select(
        `
          player_id,
          opponent_id,
          source_type,
          source_match_id,
          rating_before,
          rating_after,
          rating_change,
          event_date,
          created_at
        `,
      )
      .eq("player_id", player.id);

  if (ratingHistoryError) {
    console.error(
      "Player rating history loading error:",
      ratingHistoryError,
    );
  } else {
    playerRatingHistory =
      (playerRatingHistoryData ?? []) as RatingHistoryRow[];
  }

  const ratingSourceIds = Array.from(
    new Set(
      playerRatingHistory.map((history) => history.source_match_id),
    ),
  );

  if (ratingSourceIds.length > 0) {
    const {
      data: opponentRatingHistoryData,
      error: opponentRatingHistoryError,
    } = await supabase
      .from("player_rating_history")
      .select(
        `
          player_id,
          opponent_id,
          source_type,
          source_match_id,
          rating_before,
          rating_after,
          rating_change,
          event_date,
          created_at
        `,
      )
      .in("source_match_id", ratingSourceIds)
      .neq("player_id", player.id);

    if (opponentRatingHistoryError) {
      console.error(
        "Opponent rating history loading error:",
        opponentRatingHistoryError,
      );
    } else {
      opponentRatingHistory =
        (opponentRatingHistoryData ?? []) as RatingHistoryRow[];
    }
  }

  const ratingHistoryKey = (
    sourceType: RatingHistoryRow["source_type"],
    sourceMatchId: string,
  ) => `${sourceType}:${sourceMatchId}`;

  const playerRatingHistoryMap = new Map(
    playerRatingHistory.map((history) => [
      ratingHistoryKey(
        history.source_type,
        history.source_match_id,
      ),
      history,
    ]),
  );

  const opponentRatingHistoryMap = new Map(
    opponentRatingHistory.map((history) => [
      ratingHistoryKey(
        history.source_type,
        history.source_match_id,
      ),
      history,
    ]),
  );

  const getRatingDetails = (
    sourceType: RatingHistoryRow["source_type"],
    sourceMatchId: string,
  ) => {
    const key = ratingHistoryKey(sourceType, sourceMatchId);
    const history = playerRatingHistoryMap.get(key);
    const opponentHistory = opponentRatingHistoryMap.get(key);
    const finiteNumberOrNull = (value: unknown) => {
      if (value === null || value === undefined || value === "") {
        return null;
      }

      const number = Number(value);
      return Number.isFinite(number) ? number : null;
    };

    return {
      rating_before: finiteNumberOrNull(history?.rating_before),
      rating_after: finiteNumberOrNull(history?.rating_after),
      rating_change: finiteNumberOrNull(history?.rating_change),
      opponent_rating_before:
        finiteNumberOrNull(opponentHistory?.rating_before),
      rating_event_date: history?.event_date ?? null,
      rating_created_at: history?.created_at ?? null,
    };
  };

  const tournamentHistory = placements
    .map((placement) => {
      const tournament = tournamentsMap.get(
        placement.tournament_id,
      );

      if (!tournament) {
        return null;
      }

      return {
        id: tournament.id,
        title: tournament.title,
        slug: tournament.slug,
        href: `/tournaments/${tournament.slug}`,
        type: "tournament" as const,
        tournament_date: tournament.tournament_date,
        location: tournament.location,
        place: placement.place,
        wins: placement.wins ?? 0,
        losses: placement.losses ?? 0,
        games_won: placement.games_won ?? 0,
        games_lost: placement.games_lost ?? 0,
        game_difference: placement.game_difference ?? 0,
      };
    })
    .filter((tournament) => tournament !== null)
    .sort(
      (a, b) =>
        new Date(b.tournament_date).getTime() -
        new Date(a.tournament_date).getTime(),
    ) as ProfileTournament[];

  const leaguePlayersMap = new Map(
    leaguePlayers.map((row) => [row.season_id, row]),
  );

  const leagueHistory = leagueSeasonIds
    .map((seasonId) => {
      const season = leagueSeasonsMap.get(seasonId);

      if (!season) {
        return null;
      }

      const row = leaguePlayersMap.get(seasonId);
      const seasonMatches = leagueMatches.filter(
        (match) => match.season_id === seasonId,
      );

      const calculatedWins = seasonMatches.filter(
        (match) => match.winner_id === player.id,
      ).length;

      const calculatedLosses = seasonMatches.filter(
        (match) =>
          match.winner_id !== null &&
          match.winner_id !== player.id,
      ).length;

      const calculateGameDifference = () => {
        let playerGames = 0;
        let opponentGames = 0;

        for (const match of seasonMatches) {
          const playerIsFirst = match.player1_id === player.id;

          const sets = [
            [match.player1_set1, match.player2_set1],
            [match.player1_set2, match.player2_set2],
            [match.player1_set3, match.player2_set3],
          ];

          for (const [index, [player1Score, player2Score]] of sets.entries()) {
            if (player1Score === null || player2Score === null) {
              continue;
            }

            if (index === 2 && isThirdSetTiebreak(match)) {
              continue;
            }

            if (playerIsFirst) {
              playerGames += player1Score;
              opponentGames += player2Score;
            } else {
              playerGames += player2Score;
              opponentGames += player1Score;
            }
          }
        }

        return playerGames - opponentGames;
      };

      const lowerTitle = season.title.toLowerCase();

      const leagueSlug = lowerTitle.includes("challenger")
        ? "challenger"
        : lowerTitle.includes("ladies")
          ? "ladies"
          : "masters";

      return {
        id: `league-${season.id}`,
        title: season.title,
        slug: leagueSlug,
        href: `/league/${leagueSlug}`,
        type: "league" as const,
        tournament_date: season.start_date,
        location: "Ліга ITL",
        place: null,
        wins: row?.wins ?? calculatedWins,
        losses: row?.losses ?? calculatedLosses,
        games_won: 0,
        games_lost: 0,
        game_difference:
          row?.games_difference ?? calculateGameDifference(),
      };
    })
    .filter((item) => item !== null) as ProfileTournament[];

  const tournaments: ProfileTournament[] = [
    ...tournamentHistory,
    ...leagueHistory,
  ].sort(
    (a, b) =>
      new Date(b.tournament_date).getTime() -
      new Date(a.tournament_date).getTime(),
  );

  const tournamentProfileMatches: ProfileMatch[] = matches
    .map((match) => {
      const playerIsFirst = match.player1_id === player.id;
      const opponentId = playerIsFirst
        ? match.player2_id
        : match.player1_id;

      const opponent = opponentsMap.get(opponentId);
      const tournament = tournamentsMap.get(match.tournament_id);

      if (!opponent || !tournament) {
        return null;
      }

      return {
        id: match.id,
        tournament_id: tournament.id,
        tournament_title: tournament.title,
        tournament_date: tournament.tournament_date,
        opponent_id: opponent.id,
        opponent_name: opponent.name,
        opponent_slug: opponent.slug,
        player_set1: playerIsFirst
          ? match.player1_set1
          : match.player2_set1,
        opponent_set1: playerIsFirst
          ? match.player2_set1
          : match.player1_set1,
        player_set2: playerIsFirst
          ? match.player1_set2
          : match.player2_set2,
        opponent_set2: playerIsFirst
          ? match.player2_set2
          : match.player1_set2,
        player_set3: playerIsFirst
          ? match.player1_set3
          : match.player2_set3,
        opponent_set3: playerIsFirst
          ? match.player2_set3
          : match.player1_set3,
        third_set_is_tiebreak: isThirdSetTiebreak(match),
        is_winner: match.winner_id === player.id,
        status: match.status,
        ...getRatingDetails("tournament", match.id),
      };
    })
    .filter((match): match is ProfileMatch => match !== null);

  const leagueProfileMatches: ProfileMatch[] = leagueMatches
    .map((match) => {
      const playerIsFirst = match.player1_id === player.id;
      const opponentId = playerIsFirst
        ? match.player2_id
        : match.player1_id;

      const opponent = opponentsMap.get(opponentId);
      const season = leagueSeasonsMap.get(match.season_id);

      if (!opponent || !season || !match.winner_id) {
        return null;
      }

      const matchDate =
        match.played_at ??
        match.created_at?.slice(0, 10) ??
        season.start_date;

      return {
        id: `league-${match.id}`,
        tournament_id: season.id,
        tournament_title: season.title,
        tournament_date: matchDate,
        opponent_id: opponent.id,
        opponent_name: opponent.name,
        opponent_slug: opponent.slug,
        player_set1: playerIsFirst
          ? match.player1_set1
          : match.player2_set1,
        opponent_set1: playerIsFirst
          ? match.player2_set1
          : match.player1_set1,
        player_set2: playerIsFirst
          ? match.player1_set2
          : match.player2_set2,
        opponent_set2: playerIsFirst
          ? match.player2_set2
          : match.player1_set2,
        player_set3: playerIsFirst
          ? match.player1_set3
          : match.player2_set3,
        opponent_set3: playerIsFirst
          ? match.player2_set3
          : match.player1_set3,
        third_set_is_tiebreak: isThirdSetTiebreak(match),
        is_winner: match.winner_id === player.id,
        status: "finished",
        ...getRatingDetails("league", match.id),
      };
    })
    .filter((match): match is ProfileMatch => match !== null);

  const ratingProfileMatches: ProfileMatch[] = ratingMatches
    .map((match) => {
      const playerIsFirst = match.challenger_id === player.id;
      const opponentId = playerIsFirst
        ? match.opponent_id
        : match.challenger_id;
      const opponent = opponentsMap.get(opponentId);

      if (!opponent || !match.winner_id) {
        return null;
      }

      return {
        id: `rating-${match.id}`,
        tournament_id: "rating-match",
        tournament_title: "Рейтинговий матч",
        tournament_date: match.played_at,
        opponent_id: opponent.id,
        opponent_name: opponent.name,
        opponent_slug: opponent.slug,
        player_set1: playerIsFirst
          ? match.player1_set1
          : match.player2_set1,
        opponent_set1: playerIsFirst
          ? match.player2_set1
          : match.player1_set1,
        player_set2: playerIsFirst
          ? match.player1_set2
          : match.player2_set2,
        opponent_set2: playerIsFirst
          ? match.player2_set2
          : match.player1_set2,
        player_set3: playerIsFirst
          ? match.player1_set3
          : match.player2_set3,
        opponent_set3: playerIsFirst
          ? match.player2_set3
          : match.player1_set3,
        third_set_is_tiebreak: isThirdSetTiebreak(match),
        is_winner: match.winner_id === player.id,
        status: "finished",
        ...getRatingDetails("rating_match", match.id),
      };
    })
    .filter((match): match is ProfileMatch => match !== null);

  const profileMatches = [
    ...tournamentProfileMatches,
    ...leagueProfileMatches,
    ...ratingProfileMatches,
  ].sort(
    (a, b) => {
      const eventDateDifference =
        new Date(
          b.rating_event_date ?? b.tournament_date,
        ).getTime() -
        new Date(
          a.rating_event_date ?? a.tournament_date,
        ).getTime();

      if (eventDateDifference !== 0) {
        return eventDateDifference;
      }

      const historyOrderDifference =
        new Date(b.rating_created_at ?? 0).getTime() -
        new Date(a.rating_created_at ?? 0).getTime();

      if (historyOrderDifference !== 0) {
        return historyOrderDifference;
      }

      return b.id.localeCompare(a.id);
    },
  );

  const wins = profileMatches.filter(
    (match) => match.is_winner,
  ).length;

  const losses = profileMatches.length - wins;

  const winRate =
    profileMatches.length > 0
      ? Math.round((wins / profileMatches.length) * 100)
      : 0;

  const titles = tournaments.filter(
    (tournament) =>
      tournament.type === "tournament" && tournament.place === 1,
  ).length;

  const podiums = tournaments.filter(
    (tournament) =>
      tournament.type === "tournament" &&
      tournament.place !== null &&
      tournament.place <= 3,
  ).length;

  return {
    player,
    tournaments,
    matches: profileMatches,
    stats: {
      tournaments: tournaments.length,
      matches: profileMatches.length,
      wins,
      losses,
      winRate,
      titles,
      podiums,
    },
  };
}
