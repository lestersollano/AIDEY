import type { MapDestination } from '@/types/aidey-response';

export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

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
