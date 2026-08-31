import type { Metadata } from "next";
import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Учасники ITL — сезон 2 | Irpin Tennis",
  description: "Зареєстровані учасники та попередній розподіл за лігами.",
};

export const dynamic = "force-dynamic";

type Participant = {
  name: string;
  slug: string;
  rating: number;
  createdAt: string;
};

export default async function Season2ParticipantsPage() {
  const admin = createAdminSupabaseClient();
  const { data: registrations } = await admin
    .from("itl_season_2_registrations")
    .select("division, created_at, player:players(name, slug, rating)")
    .order("created_at", { ascending: true });

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
  const general = participants.filter((item) => item.division === "general").sort(byRating);
  const ladies = participants.filter((item) => item.division === "women").sort(byRating);

  return (
    <main className="min-h-screen bg-[#f6f0e5] px-3 py-4 text-[#123f2d] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/tournaments/itl-season-2" className="text-sm font-black text-[#ad4529]">← До реєстрації</Link>
        <div className="mt-3 rounded-2xl bg-[#123f2d] p-4 text-white sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d7f34c]">ITL — сезон 2</p>
          <h1 className="mt-1 text-2xl font-black uppercase sm:text-4xl">Учасники та попередній розподіл</h1>
          <p className="mt-2 text-xs leading-5 text-white/70 sm:text-sm">Перші 10 загального рейтингового списку — Masters, наступні 10 — Challenger, усі інші — Futures. До 20 вересня розподіл може змінюватися.</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ParticipantGroup title="Masters" subtitle="Орієнтовно 3.75+" participants={general.slice(0, 10)} startPosition={1} />
          <ParticipantGroup title="Challenger" subtitle="Орієнтовно 3.25–3.75" participants={general.slice(10, 20)} startPosition={11} />
          <ParticipantGroup title="Futures" subtitle="Орієнтовно до 3.25" participants={general.slice(20)} startPosition={21} />
          <ParticipantGroup title="Ladies" subtitle="Жіноча ліга" participants={ladies} startPosition={1} />
        </div>
      </div>
    </main>
  );
}

function ParticipantGroup({ title, subtitle, participants, startPosition }: {
  title: string;
  subtitle: string;
  participants: Participant[];
  startPosition: number;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <header className="flex items-center justify-between bg-[#123f2d] px-4 py-3 text-white">
        <div><h2 className="font-black uppercase">{title}</h2><p className="text-[10px] text-white/60">{subtitle}</p></div>
        <span className="text-xs font-bold text-white/70">{participants.length}</span>
      </header>
      {participants.length ? (
        <ol className="divide-y divide-[#123f2d]/10">
          {participants.map((participant, index) => (
            <li key={participant.slug} className="flex items-center gap-2 px-4 py-2.5">
              <span className="w-7 shrink-0 text-xs font-black text-[#ad4529]">#{startPosition + index}</span>
              <Link href={`/players/${participant.slug}`} className="min-w-0 flex-1 truncate text-sm font-black">{participant.name}</Link>
              <span className="shrink-0 rounded-full bg-[#f6f0e5] px-2 py-1 text-xs font-black">{participant.rating.toFixed(2)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-4 py-5 text-xs text-[#123f2d]/50">Поки немає учасників.</p>
      )}
    </section>
  );
}
