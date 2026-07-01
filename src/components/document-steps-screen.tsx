import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type DocumentStepsScreenProps = {
  title: string;
};

export function DocumentStepsScreen({ title }: DocumentStepsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={<Text style={styles.headerTitle}>{title}</Text>} />
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
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: brand.navy,
    textAlign: 'center',
  },
});
