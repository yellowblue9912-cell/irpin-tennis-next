export type TournamentPhoto = {
  src: string;
  alt: string;
};

const tournamentPhotos: Record<string, TournamentPhoto[]> = {
  "irpin-tennis-35-plus-2026-06-14": [
    {
      src: "/tournaments/irpin-tennis-35-plus-2026-06-14/01.jpg",
      alt: "Учасники турніру IRPIN TENNIS 3.5+, 14 червня 2026 року",
    },
  ],
  "irpin-tennis-30-35-2026-06-28": [
    {
      src: "/tournaments/irpin-tennis-30-35-2026-06-28/01.jpg",
      alt: "Учасники турніру IRPIN TENNIS 3.0–3.5, 28 червня 2026 року",
    },
  ],
};

export function getTournamentPhotos(slug: string) {
  return tournamentPhotos[slug] ?? [];
}

export function getTournamentCover(slug: string) {
  return getTournamentPhotos(slug)[0] ?? null;
}
