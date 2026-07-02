import { getCachedLocale } from '@/contexts/locale-context';
import { translate } from '@/i18n';
import type { AppLocale } from '@/i18n/types';
import { getGoogleMapsApiKey } from '@/constants/maps';
import { decodePolyline } from '@/utils/polyline';
import type { UserCoordinates } from '@/utils/maps';

export type DrivingRoute = {
  coordinates: UserCoordinates[];
  distanceMeters?: number;
  durationSeconds?: number;
};

type RoutesApiResponse = {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
    polyline?: {
      encodedPolyline?: string;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

export class DirectionsError extends Error {
  userMessage: string;

  constructor(message: string, userMessage: string) {
    super(message);
    this.name = 'DirectionsError';
    this.userMessage = userMessage;
  }
}

function parseDurationSeconds(duration?: string) {
  if (!duration?.endsWith('s')) return undefined;
  const parsed = Number.parseInt(duration.slice(0, -1), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapRoutesApiError(message: string, locale: AppLocale) {
  const normalized = message.toLowerCase();

  if (normalized.includes('routes api has not been used') || normalized.includes('disabled')) {
    return new DirectionsError(message, translate(locale, 'maps.errors.enableRoutesApi'));
  }

  if (normalized.includes('billing')) {
    return new DirectionsError(message, translate(locale, 'maps.errors.enableBilling'));
  }

  if (normalized.includes('legacy api')) {
    return new DirectionsError(message, translate(locale, 'maps.errors.useRoutesApi'));
  }

  if (normalized.includes('api key') || normalized.includes('permission')) {
    return new DirectionsError(message, translate(locale, 'maps.errors.invalidApiKey'));
  }

  return new DirectionsError(message, translate(locale, 'maps.errors.loadRoute'));
}

export async function fetchDrivingRoute(
  origin: UserCoordinates,
  destination: UserCoordinates,
  locale: AppLocale = getCachedLocale(),
): Promise<DrivingRoute> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new DirectionsError(
      'Missing Google Maps API key.',
      translate(locale, 'maps.errors.missingApiKey'),
    );
  }

  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
    },
    body: JSON.stringify({
      origin: {
        location: {
          latLng: {
            latitude: origin.latitude,
            longitude: origin.longitude,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        },
      },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_UNAWARE',
      languageCode: locale === 'en-US' ? 'en' : 'fil',
      regionCode: 'PH',
      units: 'METRIC',
    }),
  });

  const data = (await response.json()) as RoutesApiResponse;

  if (!response.ok || data.error) {
    throw mapRoutesApiError(data.error?.message ?? `Routes API HTTP ${response.status}`, locale);
  }

  const route = data.routes?.[0];
  const encodedPolyline = route?.polyline?.encodedPolyline;

  if (!encodedPolyline) {
    throw new DirectionsError(
      'Routes API returned no polyline.',
      translate(locale, 'maps.errors.noRoute'),
    );
  }

  return {
    coordinates: decodePolyline(encodedPolyline),
    distanceMeters: route.distanceMeters,
    durationSeconds: parseDurationSeconds(route.duration),
  };
}

export function getDirectionsErrorMessage(
  error: unknown,
  locale: AppLocale = getCachedLocale(),
) {
  if (error instanceof DirectionsError) return error.userMessage;
  if (error instanceof Error) return error.message;
  return translate(locale, 'maps.errors.loadRoute');
}
