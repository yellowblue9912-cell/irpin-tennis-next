import Link from "next/link";
import { getTournaments } from "../../../lib/tournaments/getTournaments";

export default async function TournamentsPage() {
  const tournaments = await getTournaments();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-[#123f2d]">
            Турніри
          </h1>

          <p className="mt-2 text-[#123f2d]/60">
            Всього турнірів: {tournaments.length}
          </p>
        </div>

        <Link
          href="/admin/tournaments/new"
          className="inline-flex items-center justify-center rounded-xl bg-[#123f2d] px-5 py-3 font-bold text-white transition hover:bg-[#1b5a41]"
        >
          + Створити турнір
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-5 text-left">Назва</th>
              <th className="p-5 text-left">Дата</th>
              <th className="p-5 text-left">Локація</th>
              <th className="p-5 text-left">Рейтинг</th>
              <th className="p-5 text-left">Статус</th>
              <th className="p-5 text-right">Дії</th>
            </tr>
          </thead>

          <tbody>
            {tournaments.map((tournament) => {
              const formattedDate = new Intl.DateTimeFormat("uk-UA", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).format(new Date(tournament.tournament_date));

              const ratingRange =
                tournament.min_rating !== null &&
                tournament.max_rating !== null
                  ? `${Number(tournament.min_rating).toFixed(2)}–${Number(
                      tournament.max_rating
                    ).toFixed(2)}`
                  : "—";

              return (
                <tr
                  key={tournament.id}
                  className="border-t transition hover:bg-[#fafafa]"
                >
                  <td className="p-5">
                    <div className="font-bold text-[#123f2d]">
                      {tournament.title}
                    </div>

                    <div className="mt-1 text-sm text-[#123f2d]/45">
                      {tournament.format || "Формат не вказано"}
                    </div>
                  </td>

                  <td className="p-5">
                    {formattedDate}
                  </td>

                  <td className="p-5">
                    {tournament.location || "—"}
                  </td>

                  <td className="p-5 font-bold">
                    {ratingRange}
                  </td>

                  <td className="p-5">
                    <TournamentStatus status={tournament.status} />
                  </td>

                  <td className="p-5 text-right">
                    <Link
                      href={`/admin/tournaments/${tournament.id}`}
                      className="inline-flex rounded-xl border border-[#123f2d]/15 px-4 py-2 text-sm font-bold transition hover:bg-[#f6f0e5]"
                    >
                      Відкрити
                    </Link>
                  </td>
                </tr>
              );
            })}

            {tournaments.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-12 text-center text-[#123f2d]/50"
                >
                  Турнірів ще немає
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TournamentStatus({ status }: { status: string }) {
  const statuses: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    draft: {
      label: "Чернетка",
      className: "bg-gray-100 text-gray-700",
    },
    registration: {
      label: "Реєстрація",
      className: "bg-blue-100 text-blue-700",
    },
    active: {
      label: "Триває",
      className: "bg-yellow-100 text-yellow-800",
    },
    finished: {
      label: "Завершений",
      className: "bg-green-100 text-green-700",
    },
    cancelled: {
      label: "Скасований",
      className: "bg-red-100 text-red-700",
    },
  };

  const currentStatus = statuses[status] ?? statuses.draft;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${currentStatus.className}`}
    >
      {currentStatus.label}
    </span>
  );
}
