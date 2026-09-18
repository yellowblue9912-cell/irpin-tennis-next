export type LeagueConfiguration = {
  slug: string;
  seasonTitle: string;
  pageTitle: string;
  shortTitle: string;
  seasonNumber: number;
  color: string;
  label: string;
};

const divisions = [
  { slug: "masters", name: "Masters", color: "#b84f2b", label: "Досвідчені гравці" },
  { slug: "challenger", name: "Challenger", color: "#55317d", label: "Розвиток і конкуренція" },
  { slug: "futures-a", name: "Futures A", color: "#7436a8", label: "Ігровий досвід і конкуренція" },
  { slug: "futures-b", name: "Futures B", color: "#16734b", label: "Перші кроки та досвід" },
  { slug: "ladies", name: "Ladies", color: "#172a52", label: "Жіноча ліга" },
];

export const season2Leagues: LeagueConfiguration[] = divisions.map((division) => ({
  slug: `${division.slug}-season-2`,
  seasonTitle: `ITL ${division.name} — Season 2`,
  pageTitle: `ITL ${division.name}`,
  shortTitle: division.name,
  seasonNumber: 2,
  color: division.color,
  label: division.label,
}));

export const leagueConfigurations: LeagueConfiguration[] = [
  ...divisions.filter((division) => !division.slug.startsWith("futures")).map((division) => ({
    slug: division.slug,
    seasonTitle: `ITL ${division.name} — Season 1`,
    pageTitle: `ITL ${division.name}`,
    shortTitle: division.name,
    seasonNumber: 1,
    color: division.color,
    label: division.label,
  })),
  ...season2Leagues,
];

export function getLeagueConfiguration(slug: string) {
  return leagueConfigurations.find((league) => league.slug === slug);
}

export function getLeagueHref(title: string) {
  const league = leagueConfigurations.find((item) => item.seasonTitle === title);
  return league ? `/league/${league.slug}` : "/league";
}

// Keep divisions in sporting order instead of relying on database row order.
// Seasons stay newest-first; unknown league names follow the known divisions.
export function compareLeagueSeasons(a: { title: string; start_date: string }, b: { title: string; start_date: string }) {
  const dateOrder = b.start_date.localeCompare(a.start_date);
  if (dateOrder) return dateOrder;
  const rank = (title: string) => {
    const configuration = leagueConfigurations.find((league) => league.seasonTitle === title);
    const index = divisions.findIndex((division) => division.name === configuration?.shortTitle);
    return index < 0 ? divisions.length : index;
  };
  return rank(a.title) - rank(b.title) || a.title.localeCompare(b.title, "uk-UA");
}
