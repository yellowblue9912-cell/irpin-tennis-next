import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const supabase = createAdminSupabaseClient();
  const { data: players, error } = await supabase
    .from("players")
    .select("id, name, rating, is_active, user_id")
    .order("rating", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Get admin players error:", error);
    throw new Error(`Не вдалося завантажити гравців: ${error.message}`);
  }

  const { data: authData, error: authError } =
    await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (authError) {
    console.error("Get auth users error:", authError);
  }

  const emailsByUserId = new Map(
    (authData?.users ?? []).map((user) => [user.id, user.email ?? ""]),
  );
  const linkedUserIds = new Set(
    (players ?? [])
      .map((player) => player.user_id)
      .filter((userId): userId is string => Boolean(userId)),
  );
  const unlinkedUsers = (authData?.users ?? []).filter(
    (user) => !linkedUserIds.has(user.id),
  );

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

      <div className="overflow-x-auto rounded-3xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-5 text-left">Ім&apos;я</th>
              <th className="p-5 text-left">Email / кабінет</th>
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

                <td className="p-5">
                  {player.user_id ? (
                    <span className="font-medium">
                      {emailsByUserId.get(player.user_id) || "Пошта не знайдена"}
                    </span>
                  ) : (
                    <span className="text-gray-400">Не прив’язано</span>
                  )}
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
                  colSpan={5}
                  className="p-10 text-center text-gray-500"
                >
                  Ще немає жодного гравця
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow">
        <h2 className="text-2xl font-black">
          Зареєстровані пошти без профілю гравця
        </h2>
        <p className="mt-2 text-gray-500">
          Ці користувачі зареєстрували особистий кабінет, але ще не прив’язані
          до жодного гравця.
        </p>

        {unlinkedUsers.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Дата реєстрації</th>
                </tr>
              </thead>
              <tbody>
                {unlinkedUsers.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-4 font-medium">
                      {user.email || "Пошта не вказана"}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString("uk-UA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 text-gray-500">Таких облікових записів немає.</p>
        )}
      </div>
    </div>
  );
}
