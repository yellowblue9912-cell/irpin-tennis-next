import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlayerFeedback from "../../../components/PlayerFeedback";
import {
  getPlayerProfile,
  type ProfileMatch,
  type ProfileTournament,
} from "../../../lib/players/getPlayerProfile";

type PlayerProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PlayerProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: player } = await supabase
    .from("players")
    .select("name, city, rating")
    .eq("slug", slug)
    .maybeSingle();

  if (!player) {
    return {
      title: "Профіль гравця | Irpin Tennis",
      robots: { index: false, follow: false },
    };
  }

  const description = `${player.name} — профіль гравця Irpin Tennis${
    player.rating ? `, рейтинг ${player.rating}` : ""
  }. Статистика матчів, перемоги, турніри та досягнення${
    player.city ? ` у місті ${player.city}` : ""
  }.`;

  return {
    title: `${player.name} — профіль тенісиста | Irpin Tennis`,
    description,
    alternates: { canonical: `/players/${slug}` },
    openGraph: {
      title: `${player.name} | Irpin Tennis`,
      description,
      url: `/players/${slug}`,
      type: "profile",
    },
  };
}

export default async function PlayerProfilePage({
  params,
}: PlayerProfilePageProps) {
  const { slug } = await params;
  const profile = await getPlayerProfile(slug);

  if (!profile) {
    notFound();
  }

  const { player, stats, tournaments, matches, achievements } = profile;

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-8 md:px-8 md:py-10">
      <Link
        href="/players"
        className="text-sm font-bold text-[#123f2d]/60 transition hover:text-[#123f2d]"
      >
        ← Повернутися до гравців
      </Link>

      <section className="mt-4 overflow-hidden rounded-2xl bg-[#123f2d] text-white sm:mt-6 sm:rounded-[32px]">
        <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3 p-4 sm:grid-cols-[140px_1fr] sm:gap-6 sm:p-7 md:grid-cols-[180px_1fr] md:p-10">
          <PlayerAvatar
            name={player.name}
            photoUrl={player.photo_url}
          />

          <div className="flex flex-col justify-center">
            <p className="hidden text-sm font-black uppercase tracking-[0.18em] text-white/50 sm:block">
              Player Profile
            </p>

            <h1 className="text-xl font-black uppercase leading-tight sm:mt-3 sm:text-4xl md:text-6xl">
              {player.name}
            </h1>

            <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-3">
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-[#123f2d] sm:px-4 sm:py-2 sm:text-base">
                Рейтинг {Number(player.rating).toFixed(2)}
              </span>

              <span className="hidden rounded-full border border-white/15 px-4 py-2 font-bold text-white/75 sm:inline">
                {player.city || "Місто не вказано"}
              </span>

              <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold text-white/75 sm:px-4 sm:py-2 sm:text-base">
                {player.is_active ? "Активний гравець" : "Неактивний"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {(player.bio || player.phone || player.address) && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          {player.bio && (
            <div className="rounded-[24px] bg-white p-5 shadow-sm sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ad4529]">
                Про гравця
              </p>
              <p className="mt-3 whitespace-pre-line leading-7 text-[#123f2d]/70">
                {player.bio}
              </p>
            </div>
          )}
          {(player.phone || player.address) && (
            <div className="rounded-[24px] bg-white p-5 shadow-sm sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ad4529]">
                Контакти
              </p>
              <div className="mt-3 space-y-2 text-sm font-bold">
                {player.phone && (
                  <a className="block hover:text-[#ad4529]" href={`tel:${player.phone}`}>
                    {player.phone}
                  </a>
                )}
                {player.address && (
                  <p>{player.address}</p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="mt-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#123f2d]/10 bg-white sm:mt-6 sm:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Турніри та ліги" value={stats.tournaments} />
        <StatCard label="Матчі" value={stats.matches} />
        <StatCard label="Перемоги" value={stats.wins} />
        <StatCard label="Поразки" value={stats.losses} />
        <StatCard label="Win Rate" value={`${stats.winRate}%`} />
        <StatCard label="Титули" value={stats.titles} />
        <StatCard label="Подіуми" value={stats.podiums} />
      </section>

      <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm sm:mt-8 sm:rounded-[28px] sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ad4529]">
              Відзнаки
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase">Досягнення</h2>
          </div>
          <p className="text-sm text-[#123f2d]/50">
            Розраховуються автоматично за результатами.
          </p>
        </div>

        {achievements.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <article
                key={achievement.id}
                className="flex gap-4 rounded-2xl bg-[#f6f0e5] p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl">
                  {achievement.icon}
                </span>
                <div>
                  <h3 className="font-black">{achievement.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-[#123f2d]/55">
                    {achievement.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState text="Досягнення з’являться після перших офіційних матчів." />
        )}
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.15fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
          <div className="border-b border-[#123f2d]/10 pb-5">
            <h2 className="text-2xl font-black uppercase text-[#123f2d]">
              Турніри та ліги
            </h2>

            <p className="mt-2 text-sm text-[#123f2d]/50">
              Участь, місця та підсумкова статистика.
            </p>
          </div>

          <details className="mt-5 rounded-2xl bg-[#f6f0e5] p-4">
            <summary className="cursor-pointer list-none font-black text-[#123f2d]">
              Переглянути всі турніри та ліги ({tournaments.length})
              <span className="float-right">⌄</span>
            </summary>
            <div className="mt-4 space-y-3">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
              />
            ))}

            {tournaments.length === 0 && (
              <EmptyState text="У гравця ще немає турнірів або ліг." />
            )}
            </div>
          </details>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
          <div className="border-b border-[#123f2d]/10 pb-5">
            <h2 className="text-2xl font-black uppercase text-[#123f2d]">
              Останні матчі
            </h2>

            <p className="mt-2 text-sm text-[#123f2d]/50">
              Результати матчів із турнірів та ліг.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {matches.slice(0, 5).map((match) => (
              <MatchCard
                key={match.id}
                match={match}
              />
            ))}

            {matches.length === 0 && (
              <EmptyState text="У гравця ще немає завершених матчів." />
            )}

            {matches.length > 5 && (
              <details className="rounded-2xl bg-[#f6f0e5] p-4">
                <summary className="cursor-pointer list-none text-center text-sm font-black uppercase text-[#123f2d]">
                  Показати більше матчів ({matches.length - 5})
                </summary>
                <div className="mt-4 space-y-3">
                  {matches.slice(5).map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </section>
      <PlayerFeedback targetPlayerId={player.id} />
    </main>
  );
}

function PlayerAvatar({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl: string | null;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="h-20 w-20 rounded-xl bg-white/10 object-cover sm:h-36 sm:w-36 sm:rounded-[24px] md:h-44 md:w-44"
      />
    );
  }

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#c6f13d] text-2xl font-black text-[#123f2d] sm:h-36 sm:w-36 sm:rounded-[24px] sm:text-4xl md:h-44 md:w-44">
      {initials}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border-b border-r border-[#123f2d]/10 p-3 sm:p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#123f2d]/45">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-[#123f2d] sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function TournamentCard({
  tournament,
}: {
  tournament: ProfileTournament;
}) {
  const formattedDate = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${tournament.tournament_date}T12:00:00`));

  const tournamentHref = tournament.id.startsWith("league-")
    ? `/league/${tournament.slug}`
    : `/tournaments/${tournament.slug}`;

  const isLeague = tournament.id.startsWith("league-");

  return (
    <div className="rounded-2xl bg-[#f6f0e5] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#123f2d]/60">
              {isLeague ? "Ліга" : "Турнір"}
            </span>
          </div>

          <Link
            href={tournamentHref}
            className="text-lg font-black text-[#123f2d] transition hover:text-[#ad4529]"
          >
            {tournament.title}
          </Link>

          <p className="mt-1 text-sm text-[#123f2d]/50">
            {formattedDate}
            {tournament.location ? ` · ${tournament.location}` : ""}
          </p>
        </div>

        <PlaceBadge place={tournament.place} isLeague={isLeague} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SmallStat
          label="Матчі"
          value={`${tournament.wins}-${tournament.losses}`}
        />

        <SmallStat
          label={isLeague ? "Перемоги" : "Гейми"}
          value={
            isLeague
              ? tournament.wins
              : `${tournament.games_won}:${tournament.games_lost}`
          }
        />

        <SmallStat
          label="Різниця"
          value={
            tournament.game_difference > 0
              ? `+${tournament.game_difference}`
              : tournament.game_difference
          }
        />

        <SmallStat
          label={isLeague ? "Статус" : "Місце"}
          value={isLeague ? "Учасник" : tournament.place ?? "—"}
        />
      </div>
    </div>
  );
}

function MatchCard({
  match,
}: {
  match: ProfileMatch;
}) {
  const score = formatScore(match);

  return (
    <div className="rounded-2xl border border-[#123f2d]/10 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-black uppercase tracking-[0.12em] text-[#123f2d]/70">
            {match.tournament_title}
          </p>

          <Link
            href={`/players/${match.opponent_slug}`}
            className="mt-1 block font-black text-[#123f2d] transition hover:text-[#ad4529]"
          >
            проти {match.opponent_name}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-black text-[#123f2d]">
            {score}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              match.is_winner
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {match.is_winner ? "Перемога" : "Поразка"}
          </span>
        </div>
      </div>
    </div>
  );
}

function PlaceBadge({
  place,
  isLeague,
}: {
  place: number | null;
  isLeague: boolean;
}) {
  if (isLeague) {
    return (
      <span className="rounded-full bg-[#123f2d] px-3 py-1 text-sm font-black text-white">
        Ліга
      </span>
    );
  }

  if (place === null) {
    return (
      <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#123f2d]/50">
        Без місця
      </span>
    );
  }

  const label =
    place === 1
      ? "🥇 1 місце"
      : place === 2
        ? "🥈 2 місце"
        : place === 3
          ? "🥉 3 місце"
          : `${place} місце`;

  return (
    <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#123f2d]">
      {label}
    </span>
  );
}

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs font-bold text-[#123f2d]/40">
        {label}
      </p>

      <p className="mt-1 font-black text-[#123f2d]">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f6f0e5] p-8 text-center text-[#123f2d]/50">
      {text}
    </div>
  );
}

function formatScore(match: ProfileMatch) {
  const sets = [
    [match.player_set1, match.opponent_set1],
    [match.player_set2, match.opponent_set2],
    [match.player_set3, match.opponent_set3],
  ];

  return sets
    .filter(
      ([playerScore, opponentScore]) =>
        playerScore !== null && opponentScore !== null,
    )
    .map(
      ([playerScore, opponentScore]) =>
        `${playerScore}:${opponentScore}`,
    )
    .join(" ");
}
