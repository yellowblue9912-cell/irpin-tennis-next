import { tennisGoAndroidFingerprints, tennisGoBundleId } from '@/lib/tennisGoLinks';

export const dynamic = 'force-dynamic';

export function GET() {
  const fingerprints = tennisGoAndroidFingerprints();
  if (!fingerprints.length) return Response.json({ error: 'App association is not configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  return Response.json([{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: tennisGoBundleId, sha256_cert_fingerprints: fingerprints },
  }], { headers: { 'Cache-Control': 'public, max-age=300' } });
}
