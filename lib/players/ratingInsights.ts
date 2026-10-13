export type InsightsPlayer = {
  id: string;
  rating: number;
  rating_base: number | null;
  is_active: boolean;
};

export type InsightsHistory = {
  player_id: string;
  opponent_id: string;
  source_type: string;
  source_match_id: string;
  event_date: string;
  rating_before: number;
  rating_after: number;
};

export type RatingInsights = {
  averageOpponentRating: number | null;
  opponentMatches: number;
  highestRank: number | null;
};

/** Players arrive in the database's name/id tie-break order. No private data. */
export function calculateRatingInsights(
  playerId: string,
  players: InsightsPlayer[],
  history: InsightsHistory[],
): RatingInsights {
  const groups = new Map<string, InsightsHistory[]>();
  for (const row of history) {
    const key = `${row.source_type}:${row.source_match_id}`;
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  const events = [...groups.values()].sort((a, b) =>
    Date.parse(a[0].event_date) - Date.parse(b[0].event_date) ||
    `${a[0].source_type}:${a[0].source_match_id}`.localeCompare(
      `${b[0].source_type}:${b[0].source_match_id}`,
    ),
  );
  const active = players.filter((player) => player.is_active);
  const tieOrder = new Map(active.map((player, index) => [player.id, index]));
  const ratings = new Map(players.map((player) => [
    player.id, player.rating_base ?? player.rating,
  ]));
  // Earliest pre-match values are the canonical baseline after a recalculation.
  const initialized = new Set<string>();
  for (const event of events) {
    for (const row of event) {
      if (!initialized.has(row.player_id)) {
        ratings.set(row.player_id, row.rating_before);
        initialized.add(row.player_id);
      }
    }
  }
  const position = () => {
    if (!tieOrder.has(playerId)) return null;
    const target = Math.round((ratings.get(playerId) ?? 0) * 100);
    return 1 + active.filter((player) => {
      // Public rankings display and sort ratings stored to two decimal places.
      const value = Math.round((ratings.get(player.id) ?? 0) * 100);
      return value > target || (value === target &&
        tieOrder.get(player.id)! < tieOrder.get(playerId)!);
    }).length;
  };
  let highestRank: number | null = null;
  let started = false;
  let opponentTotal = 0;
  let opponentMatches = 0;
  for (const event of events) {
    const own = event.find((row) => row.player_id === playerId);
    if (own) {
      started = true;
      const before = position();
      if (before !== null) highestRank = Math.min(highestRank ?? before, before);
      const primaryOpponent = event.find((row) => row.player_id === own.opponent_id);
      if (primaryOpponent) {
        // Both opposing doubles players point to the same first player on our team.
        const opponents = event.filter((row) =>
          row.opponent_id === primaryOpponent.opponent_id && row.player_id !== playerId,
        );
        if (opponents.length > 0 && opponents.every((row) => Number.isFinite(row.rating_before))) {
          opponentTotal += opponents.reduce((sum, row) => sum + row.rating_before, 0) / opponents.length;
          opponentMatches += 1;
        }
      }
    }
    // Apply all participants together: never count a half-updated match as a peak.
    for (const row of event) ratings.set(row.player_id, row.rating_after);
    if (started) {
      const after = position();
      if (after !== null) highestRank = Math.min(highestRank ?? after, after);
    }
  }
  if (started) {
    for (const player of players) ratings.set(player.id, player.rating);
    const current = position();
    if (current !== null) highestRank = Math.min(highestRank ?? current, current);
  }
  return {
    averageOpponentRating: opponentMatches ? opponentTotal / opponentMatches : null,
    opponentMatches,
    highestRank,
  };
}
