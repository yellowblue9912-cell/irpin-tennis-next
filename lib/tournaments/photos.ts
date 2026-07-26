export type TournamentPhoto = {
  src: string;
  alt: string;
};

export type TournamentVideo = {
  src: string;
  label: string;
};

const tournamentPhotos: Record<string, TournamentPhoto[]> = {
  "irpin-tennis-tournament-3-2026-05-25": [
    {
      src: "/tournaments/irpin-tennis-tournament-3-2026-05-25/01.jpg",
      alt: "Учасники турніру IRPIN TENNIS №3, 25 травня 2026 року",
    },
  ],
  "irpin-tennis-2026-05-16": [
    {
      src: "/tournaments/irpin-tennis-2026-05-16/01.jpg",
      alt: "Учасники турніру IRPIN TENNIS №2, 16 травня 2026 року",
    },
  ],
  "irpin-tennis-30-35-2026-05-31": [
    {
      src: "/tournaments/irpin-tennis-30-35-2026-05-31/01.jpg",
      alt: "Учасники турніру IRPIN TENNIS 3.0–3.5, 31 травня 2026 року",
    },
  ],
  "irpin-tennis-35-plus-2026-06-01": [
    {
      src: "/tournaments/irpin-tennis-35-plus-2026-06-01/01.jpg",
      alt: "Учасники турніру IRPIN TENNIS 3.5+, 1 червня 2026 року",
    },
  ],
  "irpin-tennis-30-35-2026-06-13": [
    {
      src: "/tournaments/irpin-tennis-30-35-2026-06-13/01.jpg",
      alt: "Учасники турніру IRPIN TENNIS 3.0–3.5, 13 червня 2026 року",
    },
  ],
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

const tournamentVideos: Record<string, TournamentVideo> = {
  "irpin-tennis-tournament-1-2026-05-11": {
    src: "/tournaments/irpin-tennis-tournament-1-2026-05-11/highlights.mp4",
    label: "Відео з турніру IRPIN TENNIS №1, 11 травня 2026 року",
  },
};

export function getTournamentPhotos(slug: string) {
  return tournamentPhotos[slug] ?? [];
}

export function getTournamentCover(slug: string) {
  return getTournamentPhotos(slug)[0] ?? null;
}

export function getTournamentVideo(slug: string) {
  return tournamentVideos[slug] ?? null;
}
