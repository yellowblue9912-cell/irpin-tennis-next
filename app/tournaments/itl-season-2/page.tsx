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
    .select("player_id, division, created_at, player:players(name, slug, rating)")
    .order("created_at", { ascending: true });

  const currentRegistration = (registrations ?? []).find((item) => item.player_id === playerId)?.division ?? null;
  const counts = (registrations ?? []).reduce<Record<string, number>>((result, item) => {
    result[item.division] = (result[item.division] ?? 0) + 1;
    return result;
  }, {});
  const participants = (registrations ?? [])
    .map((item) => {
      const player = Array.isArray(item.player) ? item.player[0] : item.player;
      if (!player) return null;
      return {
        division: item.division,
        createdAt: item.created_at,
        name: player.name,
        slug: player.slug,
        rating: Number(player.rating ?? 0),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const byRating = (a: (typeof participants)[number], b: (typeof participants)[number]) =>
    b.rating - a.rating || a.createdAt.localeCompare(b.createdAt);
  const generalParticipants = participants.filter((item) => item.division === "general").sort(byRating);
  const ladiesParticipants = participants.filter((item) => item.division === "women").sort(byRating);

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
            <span className="rounded-full bg-white/10 px-4 py-2 font-bold">Сезон: 21 вересня — 28 грудня 2026 року</span>
            <span className="rounded-full bg-[#d7f34c] px-4 py-2 font-black text-[#123f2d]">Участь безкоштовна</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {(params.registered || params.cancelled || params.error) && (
          <div className="mb-7 rounded-2xl bg-white p-5 font-bold shadow-sm">
            {params.registered
              ? "Готово! Вашу заявку прийнято."
              : params.cancelled
                ? "Вашу реєстрацію скасовано."
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
            currentRegistration={currentRegistration}
          />
          <RegistrationCard
            title="Жіноча ліга"
            description="Окремий жіночий залік. Дівчата обирають участь або в жіночій, або в загальній лізі."
            division="women"
            count={counts.women ?? 0}
            isLoggedIn={Boolean(data.user)}
            currentRegistration={currentRegistration}
          />
        </section>

        <section className="mt-8 rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ad4529]">Учасники сезону</p>
          <h2 className="mt-2 text-2xl font-black uppercase">Попередній розподіл за лігами</h2>
          <p className="mt-3 max-w-3xl leading-7 text-[#123f2d]/65">
            Учасники загальної ліги розташовані за поточним рейтингом. До завершення реєстрації склад ліг може змінюватися.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <ParticipantGroup title="Masters" participants={generalParticipants.slice(0, 10)} startPosition={1} />
            <ParticipantGroup title="Challenger" participants={generalParticipants.slice(10, 20)} startPosition={11} />
            <ParticipantGroup title="Futures" participants={generalParticipants.slice(20, 30)} startPosition={21} />
            <ParticipantGroup title="Ladies" participants={ladiesParticipants.slice(0, 10)} startPosition={1} />
          </div>
          {(generalParticipants.length > 30 || ladiesParticipants.length > 10) && (
            <div className="mt-5 rounded-2xl bg-[#f6f0e5] p-5 font-bold">
              У резерві: загальна ліга — {Math.max(0, generalParticipants.length - 30)}, жіноча ліга — {Math.max(0, ladiesParticipants.length - 10)}.
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ad4529]">Формат змагань</p>
          <h2 className="mt-2 text-2xl font-black uppercase">Регламент ліг</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Ladies", "Жіноча ліга"],
              ["Masters", "Окремий дивізіон сезону"],
              ["Challenger", "Окремий дивізіон сезону"],
              ["Futures", "Окремий дивізіон сезону"],
            ].map(([name, description]) => (
              <article key={name} className="rounded-2xl bg-[#f6f0e5] p-5">
                <h3 className="text-xl font-black uppercase">{name}</h3>
                <p className="mt-2 text-sm text-[#123f2d]/65">{description}</p>
                <p className="mt-4 font-black">10 гравців</p>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#123f2d]/10 p-5">
              <strong className="block text-lg">21 вересня — 28 грудня</strong>
              <p className="mt-2 text-sm leading-6 text-[#123f2d]/65">Період проведення сезону 2026 року.</p>
            </div>
            <div className="rounded-2xl border border-[#123f2d]/10 p-5">
              <strong className="block text-lg">Кругова система</strong>
              <p className="mt-2 text-sm leading-6 text-[#123f2d]/65">Кожен учасник грає по одному повному матчу з кожним суперником у своїй лізі.</p>
            </div>
            <div className="rounded-2xl border border-[#123f2d]/10 p-5">
              <strong className="block text-lg">9 матчів для кожного</strong>
              <p className="mt-2 text-sm leading-6 text-[#123f2d]/65">За підсумками всіх матчів буде сформована фінальна турнірна таблиця.</p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black uppercase">Як це працює</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            <li className="rounded-2xl bg-[#f6f0e5] p-5"><strong>1. Реєстрація</strong><p className="mt-2 text-sm leading-6 text-[#123f2d]/65">Подайте заявку до 20 вересня.</p></li>
            <li className="rounded-2xl bg-[#f6f0e5] p-5"><strong>2. Розподіл</strong><p className="mt-2 text-sm leading-6 text-[#123f2d]/65">Організатори сформують ліги за рівнем учасників.</p></li>
            <li className="rounded-2xl bg-[#f6f0e5] p-5"><strong>3. Старт сезону</strong><p className="mt-2 text-sm leading-6 text-[#123f2d]/65">21 вересня сформовані ліги розпочнуть сезон.</p></li>
          </ol>
        </section>
      </div>
    </main>
  );
}

type Participant = {
  name: string;
  slug: string;
  rating: number;
};

function ParticipantGroup({ title, participants, startPosition }: {
  title: string;
  participants: Participant[];
  startPosition: number;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#123f2d]/10">
      <header className="flex items-center justify-between bg-[#123f2d] px-5 py-4 text-white">
        <h3 className="text-xl font-black uppercase">{title}</h3>
        <span className="text-sm font-bold text-white/70">{participants.length}/10</span>
      </header>
      {participants.length ? (
        <ol className="divide-y divide-[#123f2d]/10">
          {participants.map((participant, index) => (
            <li key={participant.slug} className="flex items-center gap-3 px-5 py-4">
              <span className="w-8 shrink-0 font-black text-[#ad4529]">#{startPosition + index}</span>
              <Link href={`/players/${participant.slug}`} className="min-w-0 flex-1 truncate font-black hover:text-[#ad4529]">
                {participant.name}
              </Link>
              <span className="shrink-0 rounded-full bg-[#f6f0e5] px-3 py-1 text-sm font-black">
                {participant.rating.toFixed(2)}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-5 py-6 text-sm text-[#123f2d]/55">Поки немає зареєстрованих гравців.</p>
      )}
    </article>
  );
}

function RegistrationCard({ title, description, division, count, isLoggedIn, currentRegistration }: {
  title: string; description: string; division: "general" | "women"; count: number; isLoggedIn: boolean; currentRegistration: string | null;
}) {
  const isRegistered = currentRegistration === division;
  const hasOtherRegistration = Boolean(currentRegistration && !isRegistered);

  return (
    <article className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ad4529]">Сезон 2</p>
      <h2 className="mt-2 text-3xl font-black uppercase">{title}</h2>
      <p className="mt-4 min-h-20 leading-7 text-[#123f2d]/65">{description}</p>
      <p className="mt-5 font-bold">Зареєстровано: {count}</p>
      {isRegistered ? (
        <div className="mt-5">
          <div className="rounded-2xl bg-[#d7f34c] px-5 py-4 text-center font-black">Ви зареєстровані ✓</div>
          <form action={cancelSeason2Registration} className="mt-3">
            <button className="w-full rounded-2xl border border-[#ad4529]/25 px-5 py-3 font-black text-[#ad4529] transition hover:bg-[#ad4529] hover:text-white">
              Скасувати реєстрацію
            </button>
          </form>
        </div>
      ) : hasOtherRegistration ? (
        <div className="mt-5 rounded-2xl bg-[#f6f0e5] px-5 py-4 text-center font-bold text-[#123f2d]/65">
          Ви вже обрали іншу лігу
        </div>
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
