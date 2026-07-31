type ThirdSetScore = {
  player1_set3: number | null;
  player2_set3: number | null;
  notes?: string | null;
};

export function isThirdSetTiebreak(match: ThirdSetScore) {
  const first = match.player1_set3;
  const second = match.player2_set3;

  if (first === null || second === null) return false;

  const normalizedNotes = match.notes?.toLocaleLowerCase("uk-UA") ?? "";
  if (
    normalizedNotes.includes("тайбрейк") ||
    normalizedNotes.includes("tiebreak") ||
    normalizedNotes.includes("tie-break")
  ) {
    return true;
  }

  const high = Math.max(first, second);
  const low = Math.min(first, second);

  // Scores above seven cannot be a regular tennis set. A 7:0–7:4
  // score is also impossible for a completed regular set.
  return high > 7 || (high === 7 && low < 5);
}
