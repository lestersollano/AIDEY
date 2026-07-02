import * as Location from 'expo-location';

import { getCachedLocale } from '@/contexts/locale-context';
import { translate } from '@/i18n';
import type { AppLocale } from '@/i18n/types';

export type UserLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

export class LocationPermissionError extends Error {
  constructor(message?: string, locale: AppLocale = getCachedLocale()) {
    super(message ?? translate(locale, 'maps.locationPermission'));
    this.name = 'LocationPermissionError';
  }
}

function formatAddress(parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(', ');
}

export async function getUserLocationForAidey(
  locale: AppLocale = getCachedLocale(),
): Promise<UserLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new LocationPermissionError(undefined, locale);
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

export function buildLocationMessage(
  location: UserLocation,
  locale: AppLocale = getCachedLocale(),
): string {
  return translate(locale, 'maps.locationMessage', {
    label: location.label,
    latitude: location.latitude.toFixed(5),
    longitude: location.longitude.toFixed(5),
  });
}
