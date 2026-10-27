import { invitationInstallDestination } from '@/lib/invitationRedirect';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return new Response(null, {
    status: 307,
    headers: {
      Location: invitationInstallDestination(request.headers.get('user-agent') ?? ''),
      'Cache-Control': 'private, no-store',
      Vary: 'User-Agent',
    },
  });
}
