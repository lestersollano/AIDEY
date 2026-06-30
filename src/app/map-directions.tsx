import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DirectionsMap } from '@/components/directions-map';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { parseMapDirectionsParams } from '@/utils/map-navigation';

export default function MapDirectionsScreen() {
  const params = useLocalSearchParams();
  const { destination, userLocation } = parseMapDirectionsParams(params);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader title={<Text style={styles.title}>Ruta sa Mapa</Text>} />

      <View style={styles.details}>
        <Text style={styles.name}>{destination.name}</Text>
        {destination.address ? (
          <Text style={styles.address}>{destination.address}</Text>
        ) : null}
      </View>

      <View style={styles.mapWrapper}>
        <DirectionsMap
          destination={destination}
          userLocation={userLocation}
          interactive
          showRoute={!!userLocation}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: brand.navy,
    textAlign: 'center',
  },
  details: {
    marginTop: 16,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  address: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.secondary,
    lineHeight: 20,
  },
  mapWrapper: {
    flex: 1,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
  },
});
