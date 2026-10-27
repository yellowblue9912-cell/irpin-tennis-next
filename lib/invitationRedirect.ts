import { tennisGoStoreLinks } from './tennisGoLinks';
export const invitationIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function invitationInstallDestination(userAgent: string) {
  const stores = tennisGoStoreLinks();
  // Installed native apps intercept the associated HTTPS link before any HTTP request.
  // Android browsers go to Play; iPhone, iPad and desktop invitations use the iPhone test invitation.
  return /Android/i.test(userAgent) ? stores.android : stores.apple;
}
