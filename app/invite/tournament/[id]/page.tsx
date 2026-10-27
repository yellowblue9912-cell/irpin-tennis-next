import type { Metadata } from 'next';
import { EventInvitationPage } from '@/components/EventInvitationPage';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
 const { id } = await params;
 const title = 'Запрошення на турнір · TennisGo';
 const description = 'Відкрийте турнір у TennisGo. Якщо додатка немає — встановіть його на iPhone або Android.';
 const url = `https://www.irpintennis.com/invite/tournament/${encodeURIComponent(id)}`;
 return { title, description, robots: { index: false, follow: false }, openGraph: { title, description, url, siteName: 'TennisGo', type: 'website', locale: 'uk_UA', images: [{ url: '/tennisgo-invite.png', width: 1024, height: 1024, alt: 'TennisGo' }] }, twitter: { card: 'summary', title, description, images: ['/tennisgo-invite.png'] } };
}
export default async function Invitation({ params }: { params: Promise<{ id: string }> }) { return <EventInvitationPage kind="tournament" id={(await params).id} />; }
