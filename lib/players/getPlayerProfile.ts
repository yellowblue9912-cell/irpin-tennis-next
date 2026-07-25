import { createClient } from "../supabase/server";

export type ProfilePlayer = {
  id: string;
  name: string;
  slug: string;
  rating: number;
  photo_url: string | null;
  city: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  birth_date: null;
  phone_public: boolean;
  address_public: boolean;
  is_active: boolean;
};

export type ProfileAchievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
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
  is_winner: boolean;
  status: string;
};

export type PlayerProfileData = {
  player: ProfilePlayer;
  tournaments: ProfileTournament[];
  matches: ProfileMatch[];
  achievements: ProfileAchievement[];
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
  played_at: string | null;
  created_at: string;
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

export async function getPlayerProfile(
  slug: string,
): Promise<PlayerProfileData | null> {
  const supabase = await createClient();

  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("id, name, slug, rating, photo_url, city, bio, is_active")
    .eq("slug", slug)
    .single();

  if (playerError || !playerData) {
    console.error("Player profile loading error:", playerError);
    return null;
  }

  const { data: publicContacts } = await supabase
    .from("public_player_contacts")
    .select("phone, address, phone_public, address_public")
    .eq("player_id", playerData.id)
    .maybeSingle();

  const player = {
    ...playerData,
    phone: publicContacts?.phone ?? null,
    address: publicContacts?.address ?? null,
    birth_date: null,
    phone_public: publicContacts?.phone_public ?? false,
    address_public: publicContacts?.address_public ?? false,
  } as ProfilePlayer;

  const [
    { data: placementsData, error: placementsError },
    { data: matchesData, error: matchesError },
    { data: leagueMatchesData, error: leagueMatchesError },
    { data: leaguePlayersData, error: leaguePlayersError },
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
          status
        `,
      )
      .or(`player1_id.eq.${player.id},player2_id.eq.${player.id}`)
      .eq("status", "finished"),

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

  const placements = (placementsData ?? []) as PlacementRow[];
  const matches = (matchesData ?? []) as MatchRow[];
  const leagueMatches = (leagueMatchesData ?? []) as LeagueMatchRow[];
  const leaguePlayers = (leaguePlayersData ?? []) as LeaguePlayerRow[];

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
    ]),
  );

  let tournamentsMap = new Map<string, TournamentRow>();
  let leagueSeasonsMap = new Map<string, LeagueSeasonRow>();
  let opponentsMap = new Map<string, OpponentRow>();

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

          for (const [player1Score, player2Score] of sets) {
            if (player1Score === null || player2Score === null) {
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
        is_winner: match.winner_id === player.id,
        status: match.status,
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
        is_winner: match.winner_id === player.id,
        status: "finished",
      };
    })
    .filter((match): match is ProfileMatch => match !== null);

  const profileMatches = [
    ...tournamentProfileMatches,
    ...leagueProfileMatches,
  ].sort(
    (a, b) =>
      new Date(b.tournament_date).getTime() -
      new Date(a.tournament_date).getTime(),
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

  const achievements: ProfileAchievement[] = [];

  if (profileMatches.length > 0) {
    achievements.push({
      id: "first-match",
      icon: "🎾",
      title: "Перший матч",
      description: "Зіграно перший офіційний матч у спільноті.",
    });
  }
  if (wins > 0) {
    achievements.push({
      id: "first-win",
      icon: "⚡",
      title: "Перша перемога",
      description: "Здобуто першу перемогу в офіційному матчі.",
    });
  }
  [10, 25, 50, 100].forEach((milestone) => {
    if (wins >= milestone) {
      achievements.push({
        id: `wins-${milestone}`,
        icon: "🏅",
        title: `${milestone} перемог`,
        description: `Досягнуто позначки у ${milestone} перемог.`,
      });
    }
  });
  if (titles > 0) {
    achievements.push({
      id: "tournament-champion",
      icon: "🏆",
      title: "Чемпіон турніру",
      description: titles === 1 ? "Виграно перший турнір." : `Виграно турнірів: ${titles}.`,
    });
  }
  if (podiums >= 3) {
    achievements.push({
      id: "three-podiums",
      icon: "🥉",
      title: "Стабільний призер",
      description: "Три або більше фінішів на подіумі.",
    });
  }
  if (profileMatches.length >= 50) {
    achievements.push({
      id: "matches-50",
      icon: "🔥",
      title: "50 матчів",
      description: "Зіграно 50 офіційних матчів.",
    });
  }

  return {
    player,
    tournaments,
    matches: profileMatches,
    achievements,
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
