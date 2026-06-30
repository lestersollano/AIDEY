import { Image } from 'expo-image';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import type { MapDestination } from '@/types/aidey-response';
import {
  buildMapsDirectionsUrl,
  getMapRegion,
  hasMapCoordinates,
  type UserCoordinates,
} from '@/utils/maps';

type MapActionCardProps = {
  destination: MapDestination;
  userLocation?: UserCoordinates;
};

export function MapActionCard({ destination, userLocation }: MapActionCardProps) {
  const region = getMapRegion(destination, userLocation);
  const showMarker = hasMapCoordinates(destination);

  async function openInGoogleMaps() {
    const url = buildMapsDirectionsUrl(destination, userLocation);
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}>
          {showMarker ? (
            <Marker
              coordinate={{
                latitude: destination.latitude!,
                longitude: destination.longitude!,
              }}
              title={destination.name}
              description={destination.address}
            />
          ) : null}
          {userLocation ? (
            <Marker
              coordinate={userLocation}
              pinColor={brand.blue}
              title="Ikaw"
            />
          ) : null}
        </MapView>
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>{destination.name}</Text>
        {destination.address ? (
          <Text style={styles.address}>{destination.address}</Text>
        ) : null}
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          accessibilityRole="button"
          onPress={() => void openInGoogleMaps()}>
          <Text style={styles.buttonText}>Buksan sa Google Maps</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
  },
  mapContainer: {
    height: 160,
    backgroundColor: colors.secondaryMuted,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  details: {
    padding: 12,
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  address: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.secondary,
    lineHeight: 18,
  },
  button: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: brand.teal,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
});
