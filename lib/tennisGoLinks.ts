export const tennisGoBundleId = 'com.irpintennis.app';

// Signing identifiers are public association data, never private keys.
export function tennisGoAppleAppId() {
  const value = process.env.TENNIS_GO_APPLE_APP_ID?.trim() || '54W86H84FP.com.irpintennis.app';
  return value && /^[A-Z0-9]{10}\.com\.irpintennis\.app$/.test(value) ? value : null;
}

export function tennisGoAndroidFingerprints() {
  return [...new Set((process.env.TENNIS_GO_ANDROID_SHA256_FINGERPRINTS || 'CD:BA:79:84:4D:2A:A3:E7:BB:99:CF:89:6D:25:9E:80:14:5D:ED:B6:95:E6:A8:0E:57:B6:B2:BE:73:F1:5F:4D')
    .split(',').map((value) => value.trim().toUpperCase())
    .filter((value) => /^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(value)))];
}

export function tennisGoStoreLinks() {
  const appleStoreId = process.env.TENNIS_GO_APP_STORE_ID?.trim();
  const applePublished = Boolean(process.env.TENNIS_GO_APP_STORE_PUBLISHED === 'true' && appleStoreId && /^\d+$/.test(appleStoreId));
  const androidPublished = process.env.TENNIS_GO_GOOGLE_PLAY_PUBLISHED === 'true';
  return {
    apple: applePublished ? `https://apps.apple.com/app/id${appleStoreId}` : 'https://testflight.apple.com/join/b7TRQTF3',
    android: androidPublished ? `https://play.google.com/store/apps/details?id=${tennisGoBundleId}` : `https://play.google.com/apps/testing/${tennisGoBundleId}`,
    appleLabel: applePublished ? 'Завантажити з App Store' : 'Встановити на iPhone · TestFlight',
    androidLabel: androidPublished ? 'Завантажити з Google Play' : 'Встановити на Android · Google Play',
    testing: !applePublished || !androidPublished,
  };
}
