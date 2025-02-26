const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const clientSecret= process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '';

if (!webClientId || !clientId) {
  console.warn('Missing Google client IDs in environment variables');
}

export const GOOGLE_CONFIG = {
  webClientId,
  clientId,
  clientSecret
};