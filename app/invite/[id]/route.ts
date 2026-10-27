import { invitationIdPattern, invitationInstallDestination } from '@/lib/invitationRedirect';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!invitationIdPattern.test(id)) return new Response('Некоректне посилання TennisGo.', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  return new Response(null, { status: 307, headers: { Location: invitationInstallDestination(request.headers.get('user-agent') ?? ''), 'Cache-Control': 'private, no-store', Vary: 'User-Agent' } });
}
