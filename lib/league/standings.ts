export type LeagueStanding = {
  player_id: string;
  points: number;
  sets_difference: number;
  games_difference: number;
};

export type LeagueResult = {
  player1_id: string;
  player2_id: string;
  winner_id: string | null;
};

export function sortLeagueStandings<T extends LeagueStanding>(
  standings: T[],
  matches: LeagueResult[],
  fallbackCompare: (a: T, b: T) => number = (a, b) =>
    a.player_id.localeCompare(b.player_id),
): T[] {
  const headToHeadWins = new Map<string, number>();
  const standingsByPoints = new Map<number, T[]>();

  for (const standing of standings) {
    const standingsGroup = standingsByPoints.get(standing.points) ?? [];
    standingsGroup.push(standing);
    standingsByPoints.set(standing.points, standingsGroup);
  }

  for (const standingsGroup of standingsByPoints.values()) {
    if (standingsGroup.length < 2) continue;

    const tiedPlayerIds = new Set(
      standingsGroup.map((standing) => standing.player_id),
    );

    for (const match of matches) {
      if (
        tiedPlayerIds.has(match.player1_id) &&
        tiedPlayerIds.has(match.player2_id) &&
        match.winner_id
      ) {
        headToHeadWins.set(
          match.winner_id,
          (headToHeadWins.get(match.winner_id) ?? 0) + 1,
        );
      }
    }
  }

  return standings.toSorted((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const headToHeadDifference =
      (headToHeadWins.get(b.player_id) ?? 0) -
      (headToHeadWins.get(a.player_id) ?? 0);

    if (headToHeadDifference !== 0) return headToHeadDifference;
    if (b.sets_difference !== a.sets_difference) {
      return b.sets_difference - a.sets_difference;
    }
    if (b.games_difference !== a.games_difference) {
      return b.games_difference - a.games_difference;
    }

    return fallbackCompare(a, b);
  });
}
