import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { cancelSeason2Registration, registerForSeason2 } from "./actions";

export const metadata: Metadata = {
  title: "Ірпінська тенісна ліга — сезон 2 | Irpin Tennis",
  description: "Реєстрація до загальної та жіночої ліг другого сезону ITL.",
};

type PageProps = {
  searchParams: Promise<{ registered?: string; cancelled?: string; error?: string }>;
};

const messages: Record<string, string> = {
  no_player_profile: "Ваш акаунт ще не прив’язаний до профілю гравця. Напишіть адміністратору, і ми допоможемо.",
  registration_closed: "Реєстрацію вже завершено.",
  registration_failed: "Не вдалося зберегти заявку. Спробуйте ще раз.",
  cancellation_failed: "Не вдалося скасувати реєстрацію. Спробуйте ще раз.",
  already_registered: "Ви вже зареєстровані в одній із ліг. Спочатку скасуйте поточну заявку, якщо хочете змінити вибір.",
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
    .select("player_id, division")
    .order("created_at", { ascending: true });

  const currentRegistration = (registrations ?? []).find((item) => item.player_id === playerId)?.division ?? null;
  const counts = (registrations ?? []).reduce<Record<string, number>>((result, item) => {
    result[item.division] = (result[item.division] ?? 0) + 1;
    return result;
  }, {});
  return (
    <main className="min-h-screen bg-[#f6f0e5] text-[#123f2d]">
      <section className="bg-[#123f2d] text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#d7f34c] px-3 py-1 text-[10px] font-black uppercase text-[#123f2d]">Відкрита реєстрація</span>
            <span className="text-xs font-bold text-white/70">до 20 вересня · безкоштовно</span>
          </div>
          <h1 className="mt-2 max-w-4xl text-2xl font-black uppercase leading-tight sm:text-3xl">
            Ірпінська тенісна ліга — сезон 2
          </h1>
          <p className="mt-2 max-w-4xl text-xs leading-5 text-white/75 sm:text-sm">
            Оберіть загальну або жіночу лігу. Після завершення реєстрації учасників розподілять за рівнем.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        {(params.registered || params.cancelled || params.error) && (
          <div className="mb-7 rounded-2xl bg-white p-5 font-bold shadow-sm">
            {params.registered
              ? "Готово! Вашу заявку прийнято."
              : params.cancelled
                ? "Вашу реєстрацію скасовано."
              : messages[params.error ?? ""] ?? "Сталася помилка."}
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 sm:gap-5">
          <RegistrationCard
            title="Загальна ліга"
            description="Для всіх гравців. Після реєстрації учасників розподілять по дивізіонах за рівнем."
            division="general"
            count={counts.general ?? 0}
            isLoggedIn={Boolean(data.user)}
            currentRegistration={currentRegistration}
          />
          <RegistrationCard
            title="Ladies League"
            description="Окремий жіночий залік. Дівчата обирають участь або в жіночій, або в загальній лізі."
            division="women"
            count={counts.women ?? 0}
            isLoggedIn={Boolean(data.user)}
            currentRegistration={currentRegistration}
          />
        </section>

        <Link href="/tournaments/itl-season-2/participants" className="mt-4 flex items-center justify-between rounded-2xl px-5 py-4 font-black shadow-sm" style={{ backgroundColor: "#123f2d", color: "#ffffff" }}>
          <span style={{ color: "#ffffff" }}>Переглянути учасників і розподіл</span><span className="text-xl" style={{ color: "#ffffff" }}>→</span>
        </Link>
      </div>
    </main>
  );
}

function RegistrationCard({ title, description, division, count, isLoggedIn, currentRegistration }: {
  title: string; description: string; division: "general" | "women"; count: number; isLoggedIn: boolean; currentRegistration: string | null;
}) {
  const isRegistered = currentRegistration === division;
  const hasOtherRegistration = Boolean(currentRegistration && !isRegistered);

  return (
    <article className="rounded-2xl bg-white p-3 shadow-sm sm:p-6">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#ad4529] sm:text-xs">Сезон 2</p>
      <h2 className="mt-1 text-base font-black uppercase leading-tight sm:text-2xl">{title}</h2>
      <p className="mt-2 text-[11px] leading-4 text-[#123f2d]/65 sm:text-sm sm:leading-6">{description}</p>
      <p className="mt-3 text-xs font-bold sm:text-sm">Учасників: {count}</p>
      {isRegistered ? (
        <div className="mt-3">
          <div className="rounded-xl px-2 py-2.5 text-center text-[11px] font-black sm:text-sm" style={{ backgroundColor: "#d7f34c", color: "#123f2d" }}>Ви зареєстровані ✓</div>
          <form action={cancelSeason2Registration} className="mt-2">
            <button className="w-full rounded-xl border border-[#ad4529]/25 px-2 py-2 text-[10px] font-black transition sm:text-sm" style={{ backgroundColor: "#ffffff", color: "#ad4529" }}>
              Скасувати
            </button>
          </form>
        </div>
      ) : hasOtherRegistration ? (
        <div className="mt-3 rounded-xl px-2 py-2.5 text-center text-[10px] font-bold sm:text-sm" style={{ backgroundColor: "#f6f0e5", color: "#526b60" }}>
          Обрано іншу лігу
        </div>
      ) : isLoggedIn ? (
        <form action={registerForSeason2} className="mt-3">
          <input type="hidden" name="division" value={division} />
          <button className="w-full rounded-xl px-2 py-2.5 text-[11px] font-black transition sm:text-sm" style={{ backgroundColor: "#123f2d", color: "#ffffff" }}>
            Зареєструватися
          </button>
        </form>
      ) : (
        <Link href="/login?next=%2Ftournaments%2Fitl-season-2" className="mt-3 flex justify-center rounded-xl px-2 py-2.5 text-center text-[10px] font-black sm:text-sm" style={{ backgroundColor: "#123f2d", color: "#ffffff" }}>
          Увійти / реєстрація
        </Link>
      )}
    </article>
  );
}
