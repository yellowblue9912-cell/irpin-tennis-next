import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function PlayersPage() {
  const supabase = createAdminSupabaseClient();
  const { data: players, error } = await supabase
    .from("players")
    .select("id, name, rating, is_active")
    .order("rating", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Get admin players error:", error);
    throw new Error(`Не вдалося завантажити гравців: ${error.message}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black">Players</h1>

          <p className="text-gray-500 mt-2">
            Всього гравців: {(players ?? []).length}
          </p>
        </div>

        <Link
          href="/admin/players/new"
          className="inline-flex items-center justify-center rounded-xl bg-[#123f2d] px-5 py-3 font-bold text-white transition hover:opacity-90"
        >
          + Додати гравця
        </Link>
      </div>

      <div className="rounded-3xl bg-white shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-5 text-left">Ім&apos;я</th>
              <th className="p-5 text-left">Рейтинг</th>
              <th className="p-5 text-left">Статус</th>
              <th className="p-5 text-right">Дії</th>
            </tr>
          </thead>

          <tbody>
            {(players ?? []).map((player) => (
              <tr key={player.id} className="border-t">
                <td className="p-5 font-medium">
                  {player.name}
                </td>

                <td className="p-5 font-bold">
                  {player.rating}
                </td>

                <td className="p-5">
                  {player.is_active ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                      Активний
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                      Неактивний
                    </span>
                  )}
                </td>

                <td className="p-5 text-right">
                  <Link
                    href={`/admin/players/${player.id}/edit`}
                    className="inline-flex rounded-xl border border-[#123f2d]/20 px-4 py-2 text-sm font-bold hover:bg-[#f7f3ea]"
                  >
                    Редагувати
                  </Link>
                </td>
              </tr>
            ))}

            {(players ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-10 text-center text-gray-500"
                >
                  Ще немає жодного гравця
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
