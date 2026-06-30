import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { UserCoordinates } from '@/utils/maps';

type UseLiveUserLocationOptions = {
  distanceInterval?: number;
  timeInterval?: number;
};

export function useLiveUserLocation(
  enabled: boolean,
  options?: UseLiveUserLocationOptions,
) {
  const [location, setLocation] = useState<UserCoordinates | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLocation(null);
      return;
    }

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    async function startWatching() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: options?.distanceInterval ?? 10,
          timeInterval: options?.timeInterval ?? 5000,
        },
        (position) => {
          if (cancelled) return;
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
      );
    }

    void startWatching();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled, options?.distanceInterval, options?.timeInterval]);

  return location;
}
