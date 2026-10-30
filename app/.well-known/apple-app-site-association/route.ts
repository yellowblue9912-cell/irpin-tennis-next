import { tennisGoAppleAppId } from '@/lib/tennisGoLinks';

export const dynamic = 'force-dynamic';

export function GET() {
  const appId = tennisGoAppleAppId();
  if (!appId) return Response.json({ error: 'App association is not configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  return Response.json({
    applinks: { apps: [], details: [{ appID: appId, paths: ['/invite/*', '/match/*', '/tornament/*', '/tournament/*'] }] },
  }, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
