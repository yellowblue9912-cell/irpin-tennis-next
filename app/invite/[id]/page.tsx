import type { Metadata } from 'next';
import { EventInvitationPage } from '@/components/EventInvitationPage';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
 const { id } = await params;
 const title = 'Запрошення на матч · TennisGo';
 const description = 'Відкрийте матч у TennisGo. Якщо додатка немає — встановіть його на iPhone або Android.';
 const url = `https://www.irpintennis.com/invite/${encodeURIComponent(id)}`;
 return { title, description, robots: { index: false, follow: false }, openGraph: { title, description, url, siteName: 'TennisGo', type: 'website', locale: 'uk_UA', images: [{ url: '/tennisgo-invite.png', width: 1024, height: 1024, alt: 'TennisGo' }] }, twitter: { card: 'summary', title, description, images: ['/tennisgo-invite.png'] } };
}
export default async function Invitation({ params }: { params: Promise<{ id: string }> }) { return <EventInvitationPage kind="match" id={(await params).id} />; }
