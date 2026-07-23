export type TournamentPlacement = {
  place: 1 | 2 | 3;
  playerSlug: string;
};

export type Tournament = {
  slug: string;
  title: string;
  date: string;
  location: string;
  level: string;
  participants: number;
  format: string;
  status: "completed";
  placements: TournamentPlacement[];
};

export const tournaments: Tournament[] = [
  {
    slug: "irpin-open-june-2026",
    title: "Irpin Open",
    date: "13 червня 2026",
    location: "Ірпінь",
    level: "3.0–3.25",
    participants: 8,
    format: "Груповий етап",
    status: "completed",
    placements: [],
  },
  {
    slug: "irpin-masters-june-2026",
    title: "Irpin Masters",
    date: "14 червня 2026",
    location: "Ірпінь",
    level: "3.5–4.25",
    participants: 8,
    format: "Груповий етап",
    status: "completed",
    placements: [],
  },
];

export function getTournamentBySlug(slug: string) {
  return tournaments.find((tournament) => tournament.slug === slug);
}