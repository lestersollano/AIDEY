import { router } from 'expo-router';

import type { MapDestination } from '@/types/aidey-response';
import type { UserCoordinates } from '@/utils/maps';

type MapDirectionsParams = {
  name: string;
  address: string;
  query: string;
  latitude: string;
  longitude: string;
  originLat: string;
  originLng: string;
};

export function openMapDirections(
  destination: MapDestination,
  userLocation?: UserCoordinates,
) {
  const params: MapDirectionsParams = {
    name: destination.name,
    address: destination.address ?? '',
    query: destination.query ?? '',
    latitude: destination.latitude?.toString() ?? '',
    longitude: destination.longitude?.toString() ?? '',
    originLat: userLocation?.latitude.toString() ?? '',
    originLng: userLocation?.longitude.toString() ?? '',
  };

  router.push({
    pathname: '/map-directions',
    params,
  });
}

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  return typeof value === 'string' ? value : '';
}

function readNumber(
  params: Record<string, string | string[] | undefined>,
  key: string,
): number | undefined {
  const parsed = parseFloat(readParam(params, key));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseMapDirectionsParams(
  params: Record<string, string | string[] | undefined>,
): {
  destination: MapDestination;
  userLocation?: UserCoordinates;
} {
  const latitude = readNumber(params, 'latitude');
  const longitude = readNumber(params, 'longitude');
  const originLat = readNumber(params, 'originLat');
  const originLng = readNumber(params, 'originLng');

  return {
    destination: {
      name: readParam(params, 'name') || 'Destination',
      address: readParam(params, 'address') || undefined,
      query: readParam(params, 'query') || undefined,
      latitude,
      longitude,
    },
    userLocation:
      originLat != null && originLng != null
        ? { latitude: originLat, longitude: originLng }
        : undefined,
  };
}
