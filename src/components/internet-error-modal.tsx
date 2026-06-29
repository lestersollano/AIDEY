import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type InternetErrorModalProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function InternetErrorModal({ visible, onDismiss }: InternetErrorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Image
            source={require('@/assets/images/mascot/cropped/sad.png')}
            style={styles.mascot}
            contentFit="contain"
          />
          <Text style={styles.title}>Problema sa Koneksyon</Text>
          <Text style={styles.message}>
            Siguraduhing nakakonekta ka sa internet. Kung nakakonekta ka na, maaaring hindi
            stable ang iyong koneksyon.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            accessibilityLabel="Isara"
            onPress={onDismiss}>
            <Text style={styles.buttonText}>Sige</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 22, 106, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  mascot: {
    width: 120,
    height: 120,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: brand.navy,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: brand.teal,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.primary,
  },
});
