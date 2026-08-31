import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { registerForSeason2 } from "./actions";

export const metadata: Metadata = {
  title: "Ірпінська тенісна ліга — сезон 2 | Irpin Tennis",
  description: "Реєстрація до загальної та жіночої ліг другого сезону ITL.",
};

type PageProps = {
  searchParams: Promise<{ registered?: string; error?: string }>;
};

const messages: Record<string, string> = {
  no_player_profile: "Ваш акаунт ще не прив’язаний до профілю гравця. Напишіть адміністратору, і ми допоможемо.",
  registration_closed: "Реєстрацію вже завершено.",
  registration_failed: "Не вдалося зберегти заявку. Спробуйте ще раз.",
  invalid_division: "Оберіть правильний розділ ліги.",
};

export default async function Season2Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const admin = createAdminSupabaseClient();
  let playerId: string | null = null;

  if (data.user) {
    const { data: player } = await admin.from("players").select("id").eq("user_id", data.user.id).maybeSingle();
    playerId = player?.id ?? null;
  }

  const { data: registrations } = await admin
    .from("itl_season_2_registrations")
    .select("player_id, division, player:players(name, slug)")
    .order("created_at", { ascending: true });

  const registered = new Set(
    (registrations ?? [])
      .filter((item) => item.player_id === playerId)
      .map((item) => item.division),
  );
  const counts = (registrations ?? []).reduce<Record<string, number>>((result, item) => {
    result[item.division] = (result[item.division] ?? 0) + 1;
    return result;
  }, {});

  return (
    <main className="min-h-screen bg-[#f6f0e5] text-[#123f2d]">
      <section className="bg-[#123f2d] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <span className="rounded-full bg-[#d7f34c] px-4 py-2 text-xs font-black uppercase text-[#123f2d]">
            Відкрита реєстрація
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-black uppercase leading-tight sm:text-6xl">
            Ірпінська тенісна ліга — сезон 2
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">
            Учасники реєструються до загального списку, а після завершення прийому заявок будуть розподілені по лігах відповідно до рівня та кількості гравців.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/10 px-4 py-2 font-bold">Реєстрація до 20 вересня 2026 року</span>
            <span className="rounded-full bg-white/10 px-4 py-2 font-bold">Початок сезону — буде оголошено</span>
            <span className="rounded-full bg-white/10 px-4 py-2 font-bold">Вартість — буде оголошено</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {(params.registered || params.error) && (
          <div className="mb-7 rounded-2xl bg-white p-5 font-bold shadow-sm">
            {params.registered
              ? "Готово! Вашу заявку прийнято."
              : messages[params.error ?? ""] ?? "Сталася помилка."}
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          <RegistrationCard
            title="Загальна ліга"
            description="Для всіх гравців. Після реєстрації учасників розподілять по дивізіонах за рівнем."
            division="general"
            count={counts.general ?? 0}
            isLoggedIn={Boolean(data.user)}
            isRegistered={registered.has("general")}
          />
          <RegistrationCard
            title="Жіноча ліга"
            description="Окремий жіночий залік. Дівчата можуть одночасно зареєструватися і сюди, і до загальної ліги."
            division="women"
            count={counts.women ?? 0}
            isLoggedIn={Boolean(data.user)}
            isRegistered={registered.has("women")}
          />
        </section>

        <section className="mt-8 rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black uppercase">Як це працює</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            <li className="rounded-2xl bg-[#f6f0e5] p-5"><strong>1. Реєстрація</strong><p className="mt-2 text-sm leading-6 text-[#123f2d]/65">Подайте заявку до 20 вересня.</p></li>
            <li className="rounded-2xl bg-[#f6f0e5] p-5"><strong>2. Розподіл</strong><p className="mt-2 text-sm leading-6 text-[#123f2d]/65">Організатори сформують ліги за рівнем учасників.</p></li>
            <li className="rounded-2xl bg-[#f6f0e5] p-5"><strong>3. Старт сезону</strong><p className="mt-2 text-sm leading-6 text-[#123f2d]/65">Розклад і регламент опублікуємо після формування груп.</p></li>
          </ol>
        </section>
      </div>
    </main>
  );
}

function RegistrationCard({ title, description, division, count, isLoggedIn, isRegistered }: {
  title: string; description: string; division: "general" | "women"; count: number; isLoggedIn: boolean; isRegistered: boolean;
}) {
  return (
    <article className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ad4529]">Сезон 2</p>
      <h2 className="mt-2 text-3xl font-black uppercase">{title}</h2>
      <p className="mt-4 min-h-20 leading-7 text-[#123f2d]/65">{description}</p>
      <p className="mt-5 font-bold">Зареєстровано: {count}</p>
      {isRegistered ? (
        <div className="mt-5 rounded-2xl bg-[#d7f34c] px-5 py-4 text-center font-black">Ви зареєстровані ✓</div>
      ) : isLoggedIn ? (
        <form action={registerForSeason2} className="mt-5">
          <input type="hidden" name="division" value={division} />
          <button className="w-full rounded-2xl bg-[#123f2d] px-5 py-4 font-black text-white transition hover:bg-[#1b6046]">
            Зареєструватися
          </button>
        </form>
      ) : (
        <Link href="/login?next=%2Ftournaments%2Fitl-season-2" className="mt-5 flex justify-center rounded-2xl bg-[#123f2d] px-5 py-4 font-black text-white">
          Увійти або зареєструватися
        </Link>
      )}
    </article>
  );
}
