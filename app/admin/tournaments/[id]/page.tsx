import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";

type TournamentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type TournamentParticipant = {
  id: string;
  player_id: string;
  seed: number | null;
  status: string;
  players:
    | {
        id: string;
        name: string;
        rating: number;
        city: string | null;
      }
    | {
        id: string;
        name: string;
        rating: number;
        city: string | null;
      }[]
    | null;
};

export default async function TournamentPage({
  params,
}: TournamentPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (tournamentError || !tournament) {
    notFound();
  }

  const { data: participantsData, error: participantsError } = await supabase
    .from("tournament_players")
    .select(`
      id,
      player_id,
      seed,
      status,
      players (
        id,
        name,
        rating,
        city
      )
    `)
    .eq("tournament_id", id)
    .order("created_at", { ascending: true });

  if (participantsError) {
    console.error("Tournament participants error:", participantsError);
  }

  const participants = (participantsData ?? []) as TournamentParticipant[];

  const formattedDate = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${tournament.tournament_date}T12:00:00`));

  const formatLabels: Record<string, string> = {
    round_robin: "Кругова система",
    single_elimination: "Олімпійська система",
    groups_playoff: "Групи + плей-оф",
    custom: "Інший формат",
  };

  const statusLabels: Record<string, string> = {
    draft: "Чернетка",
    registration: "Реєстрація",
    active: "Триває",
    finished: "Завершений",
    cancelled: "Скасований",
  };

  const ratingRange =
    tournament.min_rating !== null && tournament.max_rating !== null
      ? `${Number(tournament.min_rating).toFixed(2)}–${Number(
          tournament.max_rating
        ).toFixed(2)}`
      : "Не вказано";

  return (
    <main>
      <Link
        href="/admin/tournaments"
        className="text-sm font-bold text-[#123f2d]/60 transition hover:text-[#123f2d]"
      >
        ← Повернутися до турнірів
      </Link>

      <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
            Tournament
          </p>

          <h1 className="mt-2 text-4xl font-black uppercase text-[#123f2d]">
            {tournament.title}
          </h1>

          <p className="mt-3 text-[#123f2d]/55">
            Керування турніром, учасниками та матчами.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/admin/tournaments/${tournament.id}/matches/new`}
            className="inline-flex items-center justify-center rounded-2xl bg-[#123f2d] px-5 py-3 font-black text-white transition hover:bg-[#1b5a41]"
          >
            Додати результат
          </Link>

          <Link
            href={`/admin/tournaments/${tournament.id}/participants`}
            className="inline-flex items-center justify-center rounded-2xl bg-[#ad4529] px-5 py-3 font-black text-white transition hover:bg-[#923820]"
          >
            Додати учасників
          </Link>

          <Link
            href={`/admin/tournaments/${tournament.id}/edit`}
            className="inline-flex items-center justify-center rounded-2xl border border-[#123f2d]/15 bg-white px-5 py-3 font-black text-[#123f2d] transition hover:bg-[#f6f0e5]"
          >
            Редагувати
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Дата" value={formattedDate} />

        <InfoCard
          label="Локація"
          value={tournament.location || "Не вказано"}
        />

        <InfoCard label="Рейтинг" value={ratingRange} />

        <InfoCard
          label="Статус"
          value={statusLabels[tournament.status] || "Чернетка"}
        />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-[28px] bg-white p-7 shadow-sm lg:col-span-2">
          <h2 className="text-2xl font-black uppercase text-[#123f2d]">
            Інформація про турнір
          </h2>

          <div className="mt-6 divide-y divide-[#123f2d]/10">
            <DetailRow
              label="Формат"
              value={
                formatLabels[tournament.format] ||
                tournament.format ||
                "Не вказано"
              }
            />

            <DetailRow label="Slug" value={tournament.slug} />

            <DetailRow
              label="Мінімальний рейтинг"
              value={
                tournament.min_rating !== null
                  ? Number(tournament.min_rating).toFixed(2)
                  : "Не вказано"
              }
            />

            <DetailRow
              label="Максимальний рейтинг"
              value={
                tournament.max_rating !== null
                  ? Number(tournament.max_rating).toFixed(2)
                  : "Не вказано"
              }
            />
          </div>

          <div className="mt-7">
            <h3 className="text-sm font-black uppercase tracking-wide text-[#123f2d]/50">
              Опис
            </h3>

            <p className="mt-3 whitespace-pre-line leading-7 text-[#123f2d]/75">
              {tournament.description || "Опис турніру поки не додано."}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] bg-[#123f2d] p-7 text-white shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-white/50">
            Учасники
          </p>

          <p className="mt-4 text-5xl font-black">
            {participants.length}
          </p>

          <p className="mt-2 text-white/60">
            Гравців додано до турніру
          </p>

          <Link
            href={`/admin/tournaments/${tournament.id}/participants`}
            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 font-black text-[#123f2d] transition hover:bg-[#f6f0e5]"
          >
            Керувати учасниками
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#123f2d]/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase text-[#123f2d]">
              Список учасників
            </h2>

            <p className="mt-2 text-sm text-[#123f2d]/50">
              Усього: {participants.length}
            </p>
          </div>

          <Link
            href={`/admin/tournaments/${tournament.id}/participants`}
            className="inline-flex items-center justify-center rounded-2xl border border-[#123f2d]/15 px-5 py-3 font-black text-[#123f2d] transition hover:bg-[#f6f0e5]"
          >
            Змінити склад
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {participants.map((participant, index) => {
            const player = Array.isArray(participant.players)
              ? participant.players[0]
              : participant.players;

            if (!player) {
              return null;
            }

            return (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-2xl bg-[#f6f0e5] p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123f2d] font-black text-white">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-black text-[#123f2d]">
                      {player.name}
                    </p>

                    <p className="text-sm text-[#123f2d]/45">
                      {player.city || "Місто не вказано"}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#123f2d]">
                  {Number(player.rating).toFixed(2)}
                </span>
              </div>
            );
          })}

          {participants.length === 0 && (
            <div className="rounded-2xl bg-[#f6f0e5] p-8 text-center text-[#123f2d]/50 md:col-span-2">
              Учасників ще не додано
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-sm">
      <p className="text-sm font-black uppercase tracking-wide text-[#123f2d]/45">
        {label}
      </p>

      <p className="mt-3 text-xl font-black text-[#123f2d]">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-bold text-[#123f2d]/50">
        {label}
      </span>

      <span className="font-black text-[#123f2d]">
        {value}
      </span>
    </div>
  );
}
