import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  getTournamentPhotos,
  getTournamentVideo,
} from "@/lib/tournaments/photos";

type TournamentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TournamentPage({
  params,
}: TournamentPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select(`
      id,
      title,
      slug,
      tournament_date,
      location,
      min_rating,
      max_rating,
      format,
      status,
      description
    `)
    .eq("slug", slug)
    .single();

  if (tournamentError || !tournament) {
    console.error("Tournament error:", tournamentError);
    notFound();
  }

  const { data: placements, error: placementsError } = await supabase
    .from("tournament_placements")
    .select(`
      place,
      wins,
      losses,
      games_won,
      games_lost,
      game_difference,
      player:players (
        id,
        name,
        slug,
        rating,
        city,
        photo_url
      )
    `)
    .eq("tournament_id", tournament.id)
    .order("place", { ascending: true });

  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select(`
      id,
      round_number,
      player1_set1,
      player2_set1,
      status,
      player1:players!matches_player1_id_fkey (
        id,
        name,
        slug
      ),
      player2:players!matches_player2_id_fkey (
        id,
        name,
        slug
      ),
      winner:players!matches_winner_id_fkey (
        id,
        name,
        slug
      )
    `)
    .eq("tournament_id", tournament.id)
    .order("round_number", { ascending: true });

  if (placementsError) {
    console.error("Placements error:", placementsError);
  }

  if (matchesError) {
    console.error("Matches error:", matchesError);
  }

  const formattedDate = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(tournament.tournament_date));
  const tournamentPhotos = getTournamentPhotos(tournament.slug);
  const tournamentVideo = getTournamentVideo(tournament.slug);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-10 lg:px-8">
        <Link
          href="/tournaments"
          className="mb-6 inline-flex text-sm text-zinc-400 transition hover:text-white"
        >
          ← Назад до турнірів
        </Link>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
            Завершений турнір
          </p>

          <h1 className="text-2xl font-black sm:text-5xl">
            {tournament.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-300">
            <span className="rounded-full bg-zinc-800 px-4 py-2">
              {formattedDate}
            </span>

            {tournament.location && (
              <span className="rounded-full bg-zinc-800 px-4 py-2">
                {tournament.location}
              </span>
            )}

            {tournament.min_rating !== null &&
              tournament.max_rating !== null && (
                <span className="rounded-full bg-zinc-800 px-4 py-2">
                  Рейтинг {tournament.min_rating}–{tournament.max_rating}
                </span>
              )}
          </div>

          {tournament.description && (
            <p className="mt-6 max-w-3xl leading-7 text-zinc-400">
              {tournament.description}
            </p>
          )}
        </section>

        {tournamentPhotos.length > 0 && (
          <section className="mt-6">
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
                Атмосфера турніру
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Фото з турніру
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {tournamentPhotos.map((photo, index) => (
                <figure
                  key={photo.src}
                  className={`relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 ${
                    index === 0 && tournamentPhotos.length % 2 === 1
                      ? "sm:col-span-2"
                      : ""
                  }`}
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </figure>
              ))}
            </div>
          </section>
        )}

        {tournamentVideo && (
          <section className="mt-6">
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
                Атмосфера турніру
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Відео з турніру
              </h2>
            </div>

            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black">
              <video
                src={tournamentVideo.src}
                aria-label={tournamentVideo.label}
                controls
                playsInline
                preload="metadata"
                className="max-h-[75vh] w-full bg-black object-contain"
              />
            </div>
          </section>
        )}

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
                Підсумки
              </p>
              <h2 className="mt-2 text-3xl font-black">Турнірна таблиця</h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left sm:min-w-[760px]">
                <thead className="bg-zinc-800/80 text-xs uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="px-5 py-4">Місце</th>
                    <th className="px-5 py-4">Гравець</th>
                    <th className="px-5 py-4 text-center">Матчі</th>
                    <th className="px-5 py-4 text-center">Перемоги</th>
                    <th className="px-5 py-4 text-center">Поразки</th>
                    <th className="px-5 py-4 text-center">Гейми</th>
                    <th className="px-5 py-4 text-center">Різниця</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800">
                  {placements?.map((placement) => {
                    const player = Array.isArray(placement.player)
                      ? placement.player[0]
                      : placement.player;

                    const matchesPlayed =
                      Number(placement.wins ?? 0) +
                      Number(placement.losses ?? 0);

                    return (
                      <tr
                        key={`${placement.place}-${player?.id}`}
                        className="transition hover:bg-zinc-800/40"
                      >
                        <td className="px-5 py-4">
                          <span className="font-black text-lime-400">
                            {placement.place}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {player ? (
                            <Link
                              href={`/players/${player.slug}`}
                              className="font-bold transition hover:text-lime-400"
                            >
                              {player.name}
                            </Link>
                          ) : (
                            <span className="text-zinc-500">
                              Невідомий гравець
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-center">
                          {matchesPlayed}
                        </td>

                        <td className="px-5 py-4 text-center font-semibold">
                          {placement.wins}
                        </td>

                        <td className="px-5 py-4 text-center">
                          {placement.losses}
                        </td>

                        <td className="px-5 py-4 text-center">
                          {placement.games_won}:{placement.games_lost}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className={
                              Number(placement.game_difference) >= 0
                                ? "font-bold text-lime-400"
                                : "font-bold text-red-400"
                            }
                          >
                            {Number(placement.game_difference) > 0 ? "+" : ""}
                            {placement.game_difference}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!placements?.length && (
              <div className="px-6 py-10 text-center text-zinc-500">
                Підсумкова таблиця ще не заповнена.
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
            Результати
          </p>

          <h2 className="mt-2 text-3xl font-black">Усі матчі</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {matches?.map((match) => {
              const player1 = Array.isArray(match.player1)
                ? match.player1[0]
                : match.player1;

              const player2 = Array.isArray(match.player2)
                ? match.player2[0]
                : match.player2;

              const winner = Array.isArray(match.winner)
                ? match.winner[0]
                : match.winner;

              return (
                <article
                  key={match.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-wider text-zinc-500">
                    <span>Матч {match.round_number}</span>
                    <span>{match.status}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span
                        className={
                          winner?.id === player1?.id
                            ? "font-bold text-white"
                            : "text-zinc-400"
                        }
                      >
                        {player1?.name ?? "Невідомий гравець"}
                      </span>

                      <span className="text-xl font-black">
                        {match.player1_set1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span
                        className={
                          winner?.id === player2?.id
                            ? "font-bold text-white"
                            : "text-zinc-400"
                        }
                      >
                        {player2?.name ?? "Невідомий гравець"}
                      </span>

                      <span className="text-xl font-black">
                        {match.player2_set1}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {!matches?.length && (
            <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-10 text-center text-zinc-500">
              Матчі для цього турніру ще не додані.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
