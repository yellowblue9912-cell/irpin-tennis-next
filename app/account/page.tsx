import { redirect } from "next/navigation";
import AccountProfileForm, {
  type EditablePlayerProfile,
} from "../../components/AccountProfileForm";
import { createClient } from "../../lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: player } = await supabase
    .from("players")
    .select("id, slug, name, photo_url, bio, city")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const { data: privateProfile } = player
    ? await supabase
        .from("player_private_profiles")
        .select("phone, address, birth_date, phone_public, address_public")
        .eq("player_id", player.id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:py-12">
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
          <AccountProfileForm
            player={
              {
                ...player,
                phone: privateProfile?.phone ?? null,
                address: privateProfile?.address ?? null,
                birth_date: privateProfile?.birth_date ?? null,
                phone_public: privateProfile?.phone_public ?? false,
                address_public: privateProfile?.address_public ?? false,
              } as EditablePlayerProfile
            }
          />
        ) : (
          <section className="rounded-[28px] bg-white p-7 shadow-sm sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c6f13d] text-2xl">
              ✓
            </div>
            <h2 className="mt-5 text-2xl font-black">Акаунт створено</h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#123f2d]/60">
              Ваш акаунт ще не прив’язаний до картки гравця. Повідомте
              адміністратору email, з яким ви зареєструвалися. Це захищає
              профілі від привласнення іншими користувачами.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
