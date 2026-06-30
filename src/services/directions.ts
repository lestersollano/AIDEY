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

function mapRoutesApiError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('routes api has not been used') || normalized.includes('disabled')) {
    return new DirectionsError(
      message,
      'I-enable ang Routes API sa Google Cloud Console para sa ruta sa mapa.',
    );
  }

  if (normalized.includes('billing')) {
    return new DirectionsError(
      message,
      'Kailangan i-enable ang billing sa Google Cloud project para sa Google Maps.',
    );
  }

  if (normalized.includes('legacy api')) {
    return new DirectionsError(
      message,
      'I-enable ang Routes API (hindi ang legacy Directions API) sa Google Cloud Console.',
    );
  }

  if (normalized.includes('api key') || normalized.includes('permission')) {
    return new DirectionsError(
      message,
      'Hindi valid ang Google Maps API key o wala itong access sa Routes API.',
    );
  }

  return new DirectionsError(message, 'Hindi ma-load ang ruta sa mapa.');
}

export async function fetchDrivingRoute(
  origin: UserCoordinates,
  destination: UserCoordinates,
): Promise<DrivingRoute> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new DirectionsError(
      'Missing Google Maps API key.',
      'Idagdag ang EXPO_PUBLIC_GOOGLE_MAPS_API_KEY para sa ruta.',
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
      languageCode: 'fil',
      regionCode: 'PH',
      units: 'METRIC',
    }),
  });

  const data = (await response.json()) as RoutesApiResponse;

  if (!response.ok || data.error) {
    throw mapRoutesApiError(data.error?.message ?? `Routes API HTTP ${response.status}`);
  }

  const route = data.routes?.[0];
  const encodedPolyline = route?.polyline?.encodedPolyline;

  if (!encodedPolyline) {
    throw new DirectionsError(
      'Routes API returned no polyline.',
      'Walang nahanap na ruta mula sa iyong lokasyon papunta sa opisina.',
    );
  }

  return {
    coordinates: decodePolyline(encodedPolyline),
    distanceMeters: route.distanceMeters,
    durationSeconds: parseDurationSeconds(route.duration),
  };
}

export function getDirectionsErrorMessage(error: unknown) {
  if (error instanceof DirectionsError) return error.userMessage;
  if (error instanceof Error) return error.message;
  return 'Hindi ma-load ang ruta sa mapa.';
}
