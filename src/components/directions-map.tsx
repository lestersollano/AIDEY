import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { getGoogleMapsApiKey } from '@/constants/maps';
import { fonts } from '@/constants/fonts';
import { fetchDrivingRoute, getDirectionsErrorMessage } from '@/services/directions';
import type { MapDestination } from '@/types/aidey-response';
import { getMapRegion, hasMapCoordinates, type UserCoordinates } from '@/utils/maps';

type ResolvedCoordinates = {
  latitude: number;
  longitude: number;
};

type DirectionsMapProps = {
  destination: MapDestination;
  userLocation?: UserCoordinates;
  interactive?: boolean;
  showRoute?: boolean;
};

async function resolveDestinationCoordinates(
  destination: MapDestination,
): Promise<ResolvedCoordinates | null> {
  if (hasMapCoordinates(destination)) {
    return {
      latitude: destination.latitude!,
      longitude: destination.longitude!,
    };
  }

  const query = destination.query ?? destination.address ?? destination.name;
  try {
    const results = await Location.geocodeAsync(query);
    const match = results[0];
    if (match) {
      return { latitude: match.latitude, longitude: match.longitude };
    }
  } catch {
    // Fall through to null.
  }

  return null;
}

export function DirectionsMap({
  destination,
  userLocation,
  interactive = false,
  showRoute = true,
}: DirectionsMapProps) {
  const mapRef = useRef<MapView>(null);
  const [resolvedDestination, setResolvedDestination] = useState<ResolvedCoordinates | null>(
    hasMapCoordinates(destination)
      ? {
          latitude: destination.latitude!,
          longitude: destination.longitude!,
        }
      : null,
  );
  const [isResolving, setIsResolving] = useState(!hasMapCoordinates(destination));
  const [routeCoordinates, setRouteCoordinates] = useState<UserCoordinates[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const apiKey = getGoogleMapsApiKey();

  useEffect(() => {
    let cancelled = false;

    async function resolveCoordinates() {
      if (hasMapCoordinates(destination)) {
        setResolvedDestination({
          latitude: destination.latitude!,
          longitude: destination.longitude!,
        });
        setIsResolving(false);
        return;
      }

      setIsResolving(true);
      const coordinates = await resolveDestinationCoordinates(destination);
      if (cancelled) return;

      setResolvedDestination(coordinates);
      setIsResolving(false);
    }

    void resolveCoordinates();

    return () => {
      cancelled = true;
    };
  }, [
    destination.address,
    destination.latitude,
    destination.longitude,
    destination.name,
    destination.query,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      if (!showRoute || !apiKey || !userLocation || !resolvedDestination) {
        setRouteCoordinates([]);
        setRouteError(null);
        setIsLoadingRoute(false);
        return;
      }

      setIsLoadingRoute(true);
      setRouteError(null);

      try {
        const route = await fetchDrivingRoute(userLocation, resolvedDestination);
        if (cancelled) return;

        setRouteCoordinates(route.coordinates);
        mapRef.current?.fitToCoordinates(route.coordinates, {
          edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
          animated: true,
        });
      } catch (error) {
        if (cancelled) return;
        setRouteCoordinates([]);
        setRouteError(getDirectionsErrorMessage(error));
      } finally {
        if (!cancelled) {
          setIsLoadingRoute(false);
        }
      }
    }

    void loadRoute();

    return () => {
      cancelled = true;
    };
  }, [
    apiKey,
    resolvedDestination?.latitude,
    resolvedDestination?.longitude,
    showRoute,
    userLocation?.latitude,
    userLocation?.longitude,
  ]);

  const region = getMapRegion(
    resolvedDestination
      ? { ...destination, ...resolvedDestination }
      : destination,
    userLocation,
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={interactive}
        showsUserLocation={interactive && !!userLocation}
        showsMyLocationButton={interactive && !!userLocation}>
        {resolvedDestination ? (
          <Marker
            coordinate={resolvedDestination}
            title={destination.name}
            description={destination.address}
          />
        ) : null}
        {userLocation ? (
          <Marker coordinate={userLocation} pinColor={brand.blue} title="Ikaw" />
        ) : null}
        {routeCoordinates.length > 0 ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor={brand.teal}
          />
        ) : null}
      </MapView>

      {isResolving || isLoadingRoute ? (
        <View style={styles.overlay}>
          <ActivityIndicator size="small" color={brand.teal} />
        </View>
      ) : null}

      {!isResolving && !resolvedDestination ? (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Hindi mahanap ang lokasyon sa mapa.</Text>
        </View>
      ) : null}

      {!apiKey && showRoute && userLocation && resolvedDestination ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Idagdag ang EXPO_PUBLIC_GOOGLE_MAPS_API_KEY para sa ruta.
          </Text>
        </View>
      ) : null}

      {routeError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{routeError}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondaryMuted,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 20,
  },
  overlayText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  banner: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 22, 106, 0.88)',
  },
  bannerText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
