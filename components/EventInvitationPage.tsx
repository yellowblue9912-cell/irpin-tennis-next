import { createClient } from '@supabase/supabase-js';
import { tennisGoStoreLinks } from '@/lib/tennisGoLinks';
import { notFound } from 'next/navigation';
export const eventIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function EventInvitationPage({ kind, id }: { kind: 'match' | 'tournament'; id: string }) {
  if (!eventIdPattern.test(id)) notFound();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let event: { title: string; city?: string; court?: string; scheduled_at?: string; start_date?: string; status: string; registered?: number; participant_limit?: number } | null = null;
  let failed = !url || !key;
  if (url && key) {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const result = await client.rpc('get_public_event_invitation', { p_kind: kind, p_id: id });
    failed = Boolean(result.error); event = result.data;
  }
  const stores = tennisGoStoreLinks();
  const noun = kind === 'match' ? 'матч' : 'турнір';
  const appUrl = `irpintennis://${kind === 'match' ? 'scheduled-match' : 'tournament'}/${id}`;
  return <main className="mx-auto w-full max-w-lg px-5 py-10 sm:py-16"><section className="rounded-3xl border border-[#e6e7e3] bg-white p-7 shadow-sm sm:p-10">
    <p className="mb-3 text-sm font-bold tracking-widest text-[#b65b3b]">TENNIS GO</p>
    <h1 className="mb-4 text-3xl font-bold">{event?.title || `Запрошення на ${noun}`}</h1>
    {event ? <div className="mb-6 space-y-2 text-[#66756c]">
      <p>{[event.city, event.court].filter(Boolean).join(' · ')}</p>
      <p>{event.scheduled_at ? new Date(event.scheduled_at).toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : event.start_date ? new Date(`${event.start_date}T12:00:00Z`).toLocaleDateString('uk-UA') : ''}</p>
      {event.participant_limit ? <p>Учасники: {event.registered ?? 0}/{event.participant_limit}</p> : null}
    </div> : <p className="mb-6 text-[#66756c]">{failed ? 'Деталі тимчасово недоступні. Спробуйте відкрити запрошення в додатку.' : 'Подія більше недоступна. Можливо, організатор її видалив.'}</p>}
    {(event || failed) ? <a href={appUrl} className="flex min-h-14 items-center justify-center rounded-2xl bg-[#123f2d] px-5 py-4 text-center font-bold !text-white">Відкрити {noun} у Tennis Go</a> : null}
    <p className="mt-4 text-sm leading-relaxed text-[#66756c]">Перегляд без входу. Щоб приєднатися до матчу або зареєструватися на турнір, створіть особистий кабінет.</p>
    <div className="mt-7 space-y-3 border-t border-[#e6e7e3] pt-6">
      <h2 className="text-lg font-bold">Ще немає додатка?</h2>
      <a href={stores.apple} className="block rounded-xl border border-[#e6e7e3] px-4 py-4 text-center font-bold">{stores.appleLabel}</a>
      <a href={stores.android} className="block rounded-xl border border-[#e6e7e3] px-4 py-4 text-center font-bold">{stores.androidLabel}</a>
      {stores.testing ? <p className="text-sm leading-relaxed text-[#66756c]">Зараз Tennis Go доступний для тестування. На iPhone спочатку встановіть TestFlight; Google Play може вимагати додавання вашого Google-акаунта до тестувальників.</p> : null}
      <p className="text-sm leading-relaxed text-[#66756c]">Після встановлення поверніться до цього запрошення й натисніть «Відкрити {noun} у Tennis Go». Якщо Telegram не відкриває додаток, відкрийте посилання в Safari або Chrome.</p>
    </div>
  </section></main>;
}
