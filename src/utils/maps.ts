import type { MapDestination } from '@/types/aidey-response';

export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

export const OFFICE_PROXIMITY_METERS = 100;

export function distanceMeters(
  origin: UserCoordinates,
  destination: UserCoordinates,
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusM = 6371000;
  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLng = toRadians(destination.longitude - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return earthRadiusM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getMapDestinationKey(destination: MapDestination): string | null {
  if (destination.latitude == null || destination.longitude == null) return null;
  return `${destination.latitude.toFixed(5)},${destination.longitude.toFixed(5)}`;
}

export function isWithinOfficeProximity(
  userLocation: UserCoordinates,
  destination: MapDestination,
  radiusMeters = OFFICE_PROXIMITY_METERS,
): boolean {
  if (destination.latitude == null || destination.longitude == null) return false;
  return (
    distanceMeters(userLocation, {
      latitude: destination.latitude,
      longitude: destination.longitude,
    }) <= radiusMeters
  );
}

export function getMapRegion(
  destination: MapDestination,
  userLocation?: UserCoordinates,
) {
  const destLat = destination.latitude;
  const destLng = destination.longitude;

  if (destLat == null || destLng == null) {
    return {
      latitude: userLocation?.latitude ?? 14.5995,
      longitude: userLocation?.longitude ?? 120.9842,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }

  if (!userLocation) {
    return {
      latitude: destLat,
      longitude: destLng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }

  const minLat = Math.min(userLocation.latitude, destLat);
  const maxLat = Math.max(userLocation.latitude, destLat);
  const minLng = Math.min(userLocation.longitude, destLng);
  const maxLng = Math.max(userLocation.longitude, destLng);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.02),
  };
}

export function hasMapCoordinates(destination: MapDestination): boolean {
  return destination.latitude != null && destination.longitude != null;
}
