import type { Metadata } from 'next';
import { EventInvitationPage } from '@/components/EventInvitationPage';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Запрошення на матч · Tennis Go', description: 'Перегляньте матч у Tennis Go та приєднайтеся після реєстрації.', robots: { index: false, follow: false } };
export default async function Invitation({ params }: { params: Promise<{ id: string }> }) { return <EventInvitationPage kind="match" id={(await params).id} />; }
