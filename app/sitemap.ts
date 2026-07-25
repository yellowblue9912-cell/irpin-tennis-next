import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const baseUrl = "https://www.irpintennis.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    {
      url: `${baseUrl}/players`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tournaments`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/league`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/league/masters`,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/league/challenger`,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/league/ladies`,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/courts`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/courts/vyhovskoho`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/courts/terrakort`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/courts/campa-bucha`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/courts/luvs`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/courts/pushcha-vodytsia`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/courts/diussh-irpin`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/coaches`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rating`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return staticPages;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const [{ data: players }, { data: tournaments }] = await Promise.all([
    supabase.from("players").select("slug"),
    supabase.from("tournaments").select("slug, tournament_date"),
  ]);

  const playerPages: MetadataRoute.Sitemap = (players ?? []).map((player) => ({
    url: `${baseUrl}/players/${player.slug}`,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  const tournamentPages: MetadataRoute.Sitemap = (tournaments ?? []).map(
    (tournament) => ({
      url: `${baseUrl}/tournaments/${tournament.slug}`,
      lastModified: tournament.tournament_date,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  return [...staticPages, ...playerPages, ...tournamentPages];
}
