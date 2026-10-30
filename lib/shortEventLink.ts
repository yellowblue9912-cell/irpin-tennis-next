import { createClient } from '@supabase/supabase-js';
import { invitationIdPattern, invitationInstallDestination } from './invitationRedirect';

export async function shortEventResponse(request: Request, kind: 'match' | 'tournament', code: string) {
  if (!/^[a-f0-9]{8}$/i.test(code) && !invitationIdPattern.test(code)) {
    return new Response('Посилання TennisGo не знайдено.', { status: 404 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return new Response('Спробуйте пізніше.', { status: 503 });
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const resolved = invitationIdPattern.test(code) ? { data: code, error: null }
    : await client.rpc('resolve_event_share_code', { p_kind: kind, p_code: code });
  if (resolved.error) return new Response('Спробуйте пізніше.', { status: 503 });
  if (!resolved.data) return new Response('Посилання TennisGo не знайдено.', { status: 404 });
  const event = await client.rpc('get_public_event_invitation', { p_kind: kind, p_id: resolved.data });
  if (event.error) return new Response('Спробуйте пізніше.', { status: 503 });
  if (!event.data) return new Response('Посилання TennisGo не знайдено.', { status: 404 });
  const agent = request.headers.get('user-agent') ?? '';
  if (/TelegramBot|facebookexternalhit|Twitterbot|WhatsApp|Discordbot/i.test(agent)) {
    const escape = (value: string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
    const title = kind === 'match' ? 'Запрошення на матч · TennisGo' : `${event.data.title} · TennisGo`;
    const description = [event.data.city, event.data.court, event.data.scheduled_at ?? event.data.start_date].filter(Boolean).join(' · ');
    return new Response(`<!doctype html><html lang="uk"><head><meta charset="utf-8"><title>${escape(title)}</title><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:site_name" content="TennisGo"><meta property="og:image" content="https://tennisgo.club/tennisgo-invite.png"></head><body>${escape(title)}</body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', Vary: 'User-Agent' } });
  }
  // Native association intercepts this path before HTTP. Uninstalled clients go to installation.
  return new Response(null, { status: 307, headers: { Location: invitationInstallDestination(agent), 'Cache-Control': 'private, no-store', Vary: 'User-Agent' } });
}
