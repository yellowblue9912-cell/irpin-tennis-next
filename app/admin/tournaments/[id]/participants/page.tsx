import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../../../lib/supabase/server";

type ParticipantsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Player = {
  id: string;
  name: string;
  rating: number;
  city: string | null;
  is_active: boolean;
};

type TournamentPlayer = {
  player_id: string;
};

export default async function ParticipantsPage({
  params,
}: ParticipantsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, title")
    .eq("id", id)
    .single();

  if (tournamentError || !tournament) {
    notFound();
  }

  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("id, name, rating, city, is_active")
    .eq("is_active", true)
    .order("rating", { ascending: false })
    .order("name", { ascending: true });

  if (playersError) {
    console.error("Players loading error:", playersError);
  }

  const { data: tournamentPlayersData, error: tournamentPlayersError } =
    await supabase
      .from("tournament_players")
      .select("player_id")
      .eq("tournament_id", id);

  if (tournamentPlayersError) {
    console.error(
      "Tournament players loading error:",
      tournamentPlayersError
    );
  }

  const players = (playersData ?? []) as Player[];

  const tournamentPlayers = (tournamentPlayersData ??
    []) as TournamentPlayer[];

  const selectedPlayerIds = new Set(
    tournamentPlayers.map((item) => item.player_id)
  );

  async function saveParticipants(formData: FormData) {
    "use server";

    const selectedIds = formData
      .getAll("player_ids")
      .map((value) => String(value));

    const supabase = await createClient();

    const { data: existingParticipants, error: existingError } =
      await supabase
        .from("tournament_players")
        .select("player_id")
        .eq("tournament_id", id);

    if (existingError) {
      console.error(
        "Existing participants loading error:",
        existingError
      );

      throw new Error(
        `Не вдалося отримати учасників: ${existingError.message}`
      );
    }

    const existingIds = new Set(
      (existingParticipants ?? []).map((item) => item.player_id)
    );

    const idsToAdd = selectedIds.filter(
      (playerId) => !existingIds.has(playerId)
    );

    const idsToRemove = [...existingIds].filter(
      (playerId) => !selectedIds.includes(playerId)
    );

    if (idsToAdd.length > 0) {
      const rowsToInsert = idsToAdd.map((playerId) => ({
        tournament_id: id,
        player_id: playerId,
        status: "active",
      }));

      const { error: insertError } = await supabase
        .from("tournament_players")
        .insert(rowsToInsert);

      if (insertError) {
        console.error("Participants insert error:", insertError);

        throw new Error(
          `Не вдалося додати учасників: ${insertError.message}`
        );
      }
    }

    if (idsToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from("tournament_players")
        .delete()
        .eq("tournament_id", id)
        .in("player_id", idsToRemove);

      if (deleteError) {
        console.error("Participants delete error:", deleteError);

        throw new Error(
          `Не вдалося видалити учасників: ${deleteError.message}`
        );
      }
    }

    revalidatePath(`/admin/tournaments/${id}`);
    revalidatePath(`/admin/tournaments/${id}/participants`);

    redirect(`/admin/tournaments/${id}`);
  }

  return (
    <main>
      <Link
        href={`/admin/tournaments/${id}`}
        className="text-sm font-bold text-[#123f2d]/60 transition hover:text-[#123f2d]"
      >
        ← Повернутися до турніру
      </Link>

      <div className="mt-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
          Participants
        </p>

        <h1 className="mt-2 text-4xl font-black uppercase text-[#123f2d]">
          Учасники турніру
        </h1>

        <p className="mt-3 text-[#123f2d]/55">
          {tournament.title}
        </p>
      </div>

      <form
        action={saveParticipants}
        className="mt-8 max-w-4xl rounded-[28px] bg-white p-7 shadow-sm md:p-9"
      >
        <div className="flex flex-col gap-3 border-b border-[#123f2d]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase text-[#123f2d]">
              Обери гравців
            </h2>

            <p className="mt-2 text-sm text-[#123f2d]/50">
              Зараз у турнірі: {selectedPlayerIds.size}
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-[#123f2d] px-6 py-3 font-black text-white transition hover:bg-[#1b5a41]"
          >
            Зберегти учасників
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {players.map((player) => (
            <label
              key={player.id}
              className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[#123f2d]/10 bg-[#f6f0e5] p-4 transition hover:border-[#123f2d]/30"
            >
              <input
                type="checkbox"
                name="player_ids"
                value={player.id}
                defaultChecked={selectedPlayerIds.has(player.id)}
                className="h-5 w-5 shrink-0 accent-[#123f2d]"
              />

              <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-[#123f2d]">
                    {player.name}
                  </p>

                  <p className="text-sm text-[#123f2d]/45">
                    {player.city || "Місто не вказано"}
                  </p>
                </div>

                <div className="mt-2 inline-flex w-fit rounded-full bg-white px-3 py-1 text-sm font-black text-[#123f2d] sm:mt-0">
                  Рейтинг {Number(player.rating).toFixed(2)}
                </div>
              </div>
            </label>
          ))}

          {players.length === 0 && (
            <div className="rounded-2xl bg-[#f6f0e5] p-8 text-center text-[#123f2d]/50">
              Активних гравців ще немає
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#123f2d]/10 pt-6 sm:flex-row">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-[#123f2d] px-6 py-3 font-black text-white transition hover:bg-[#1b5a41]"
          >
            Зберегти учасників
          </button>

          <Link
            href={`/admin/tournaments/${id}`}
            className="inline-flex items-center justify-center rounded-2xl border border-[#123f2d]/15 px-6 py-3 font-black text-[#123f2d] transition hover:bg-[#f6f0e5]"
          >
            Скасувати
          </Link>
        </div>
      </form>
    </main>
  );
}