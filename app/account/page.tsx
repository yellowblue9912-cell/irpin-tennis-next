import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountProfileForm, {
  type EditablePlayerProfile,
} from "../../components/AccountProfileForm";
import RatingMatchDashboard, {
  type RatingMatch,
  type RatingMatchPlayer,
} from "../../components/RatingMatchDashboard";
import { createClient } from "../../lib/supabase/server";
import PlayerProfileClaimForm from "../../components/PlayerProfileClaimForm";

export const metadata: Metadata = {
  title: "Особистий кабінет гравця | Irpin Tennis",
  description:
    "Керуйте профілем Irpin Tennis: фото, інформація про себе, контакти, приватність і публічна картка гравця.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: player } = await supabase
    .from("players")
    .select("id, slug, name, photo_url, bio, city, rating")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const { data: privateProfile } = player
    ? await supabase
        .from("player_private_profiles")
        .select("phone, birth_date, tennis_experience_years, phone_public")
        .eq("player_id", player.id)
        .maybeSingle()
    : { data: null };

  const [{ data: registeredPlayers }, { data: ratingMatches }, { data: claims }] =
    await Promise.all([
        supabase
          .from("players")
          .select("id, name, rating")
          .is("user_id", null)
          .eq("is_active", true)
          .order("name"),
        player ? supabase
          .from("rating_matches")
          .select(
            "id, challenger_id, opponent_id, status, submitted_by_player_id, winner_id, player1_set1, player2_set1, player1_set2, player2_set2, player1_set3, player2_set3, played_at, created_at",
          )
          .or(
            `challenger_id.eq.${player.id},opponent_id.eq.${player.id}`,
          )
          .order("created_at", { ascending: false })
          .limit(30) : Promise.resolve({ data: [] }),
        player ? Promise.resolve({ data: [] }) : supabase
          .from("player_profile_claims")
          .select("id, requested_player_id, requested_name, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-5xl bg-[#f4efe4] px-3 py-5 text-[#123f2d] sm:px-6 sm:py-8 md:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
            Особистий кабінет
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase sm:text-5xl">
            Мій профіль
          </h1>
          <p className="mt-3 text-[#123f2d]/55">{data.user.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="rounded-xl border border-[#123f2d]/15 px-5 py-3 font-black">
            Вийти
          </button>
        </form>
      </div>

      <div className="mt-8">
        {player ? (
          <>
            <AccountProfileForm
            player={
              {
                ...player,
                phone: privateProfile?.phone ?? null,
                birth_date: privateProfile?.birth_date ?? null,
                tennis_experience_years:
                  privateProfile?.tennis_experience_years ?? null,
                phone_public: privateProfile?.phone_public ?? false,
              } as EditablePlayerProfile
            }
            />
            <RatingMatchDashboard
              currentPlayer={
                {
                  id: player.id,
                  name: player.name,
                  slug: player.slug,
                  rating: player.rating,
                } as RatingMatchPlayer
              }
              opponents={(registeredPlayers ?? []) as RatingMatchPlayer[]}
              matches={(ratingMatches ?? []) as RatingMatch[]}
            />
          </>
        ) : (
          <section className="rounded-[28px] bg-white p-7 shadow-sm sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c6f13d] text-2xl">
              ✓
            </div>
            <h2 className="mt-5 text-2xl font-black">Акаунт створено</h2>
            <h2 className="mt-5 text-2xl font-black">Прив’яжіть профіль гравця</h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#123f2d]/60">
              Оберіть свою картку зі списку або подайте заявку на нову. Після
              перевірки адміністратор прив’яже профіль до цього акаунта.
            </p>
            {claims?.[0]?.status === "pending" ? (
              <div className="mt-6 rounded-2xl bg-[#f7f1e7] p-5">
                <p className="font-black">Заявка очікує перевірки</p>
                <p className="mt-1 text-sm text-[#123f2d]/60">
                  {claims[0].requested_name
                    ? `Новий профіль: ${claims[0].requested_name}`
                    : "Запит на прив’язку наявної картки гравця"}
                </p>
              </div>
            ) : (
              <PlayerProfileClaimForm players={registeredPlayers ?? []} />
            )}
          </section>
        )}
      </div>
    </main>
  );
}
