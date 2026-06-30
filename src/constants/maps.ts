export function getGoogleMapsApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
}
