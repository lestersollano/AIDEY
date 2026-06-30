import type { MapDestination } from '@/types/aidey-response';

export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

export function buildMapsSearchUrl(destination: MapDestination): string {
  if (destination.latitude != null && destination.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
  }

  const query = destination.query ?? destination.address ?? destination.name;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildMapsDirectionsUrl(
  destination: MapDestination,
  origin?: UserCoordinates,
): string {
  let destinationParam: string;
  if (destination.latitude != null && destination.longitude != null) {
    destinationParam = `${destination.latitude},${destination.longitude}`;
  } else {
    destinationParam = encodeURIComponent(
      destination.query ?? destination.address ?? destination.name,
    );
  }

  const params = new URLSearchParams({ api: '1', destination: destinationParam });
  if (origin) {
    params.set('origin', `${origin.latitude},${origin.longitude}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
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
