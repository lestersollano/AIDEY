import * as Location from 'expo-location';

export type UserLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

export class LocationPermissionError extends Error {
  constructor(message = 'Location permission was denied.') {
    super(message);
    this.name = 'LocationPermissionError';
  }
}

function formatAddress(parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(', ');
}

export async function getUserLocationForAidey(): Promise<UserLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new LocationPermissionError(
      'Kailangan namin ng iyong lokasyon para mahanap ang pinakamalapit na opisina.',
    );
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = position.coords;
  let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (address) {
      const formatted = formatAddress([
        address.district ?? address.subregion,
        address.city ?? address.subregion,
        address.region,
      ]);
      if (formatted) {
        label = formatted;
      }
    }
  } catch {
    // Keep coordinate label if reverse geocoding fails.
  }

  return { latitude, longitude, label };
}

export function buildLocationMessage(location: UserLocation): string {
  return `Nasa ${location.label} ako (${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}). Hanapin ang pinakamalapit na opisina.`;
}
