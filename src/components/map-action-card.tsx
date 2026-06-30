import { Pressable, StyleSheet, View } from 'react-native';

import { DirectionsMap } from '@/components/directions-map';
import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import type { MapDestination } from '@/types/aidey-response';
import { openMapDirections } from '@/utils/map-navigation';
import type { UserCoordinates } from '@/utils/maps';

type MapActionCardProps = {
  destination: MapDestination;
  userLocation?: UserCoordinates;
};

export function MapActionCard({ destination, userLocation }: MapActionCardProps) {
  function openDirections() {
    openMapDirections(destination, userLocation);
  }

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.mapContainer}
        accessibilityRole="button"
        accessibilityLabel="Buksan ang mapa"
        onPress={openDirections}>
        <DirectionsMap
          destination={destination}
          userLocation={userLocation}
          showRoute={!!userLocation}
        />
      </Pressable>

      <View style={styles.details}>
        <Text style={styles.name}>{destination.name}</Text>
        {destination.address ? (
          <Text style={styles.address}>{destination.address}</Text>
        ) : null}
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          accessibilityRole="button"
          onPress={openDirections}>
          <Text style={styles.buttonText}>
            {userLocation ? 'Tingnan ang ruta' : 'Tingnan sa mapa'}
          </Text>
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
