import type { Metadata } from 'next';
import { EventInvitationPage } from '@/components/EventInvitationPage';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Запрошення на турнір · Tennis Go', description: 'Перегляньте турнір у Tennis Go та зареєструйтеся через особистий кабінет.', robots: { index: false, follow: false } };
export default async function Invitation({ params }: { params: Promise<{ id: string }> }) { return <EventInvitationPage kind="tournament" id={(await params).id} />; }
