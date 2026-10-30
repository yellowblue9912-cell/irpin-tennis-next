import { shortEventResponse } from '@/lib/shortEventLink';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  return shortEventResponse(request, 'match', (await params).code);
}
