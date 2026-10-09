import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { reviewProfileClaim } from "./actions";

export const dynamic = "force-dynamic";

export default async function PlayerClaimsPage() {
  const supabase = createAdminSupabaseClient();
  const { data: claims, error } = await supabase
    .from("player_profile_claims")
    .select("id, user_id, requested_player_id, requested_name, created_at, player:players!player_profile_claims_requested_player_id_fkey(name, rating)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Не вдалося завантажити заявки: ${error.message}`);

  const users = await Promise.all((claims ?? []).map(async (claim) => {
    const { data } = await supabase.auth.admin.getUserById(claim.user_id);
    return [claim.id, data.user?.email ?? "Email не знайдено"] as const;
  }));
  const emails = new Map(users);

  return (
    <main>
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">Гравці</p>
      <h1 className="mt-2 text-4xl font-black">Заявки на профіль</h1>
      <p className="mt-3 text-[#123f2d]/60">Перевірте заявки, перш ніж прив’язати профіль або створити новий.</p>
      <div className="mt-8 grid gap-4">
        {(claims ?? []).map((claim) => {
          const player = Array.isArray(claim.player) ? claim.player[0] : claim.player;
          return (
            <article key={claim.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-[#123f2d]/55">{emails.get(claim.id)}</p>
              <h2 className="mt-2 text-xl font-black">
                {claim.requested_name ? `Новий профіль: ${claim.requested_name}` : `Прив’язати: ${player?.name ?? "Профіль видалено"}`}
              </h2>
              {player && <p className="mt-1 text-sm text-[#123f2d]/60">Поточний рейтинг: {Number(player.rating).toFixed(2)}</p>}
              <p className="mt-2 text-xs text-[#123f2d]/45">Подано {new Date(claim.created_at).toLocaleDateString("uk-UA")}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <form action={reviewProfileClaim}>
                  <input type="hidden" name="claimId" value={claim.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <button disabled={!claim.requested_name && !player} className="rounded-xl bg-[#123f2d] px-5 py-3 font-black text-white disabled:opacity-40">Підтвердити</button>
                </form>
                <form action={reviewProfileClaim}>
                  <input type="hidden" name="claimId" value={claim.id} />
                  <input type="hidden" name="decision" value="reject" />
                  <button className="rounded-xl border border-[#123f2d]/20 px-5 py-3 font-black">Відхилити</button>
                </form>
              </div>
            </article>
          );
        })}
        {(claims ?? []).length === 0 && <p className="rounded-3xl bg-white p-8 text-[#123f2d]/60">Немає заявок на перевірку.</p>}
      </div>
    </main>
  );
}
