import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AideyWordmark } from '@/components/aidey-wordmark';
import { Text } from '@/components/text';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { LOCALE_LABELS } from '@/i18n/types';

const SIDEBAR_WIDTH = Math.min(320, Dimensions.get('window').width * 0.82);

const OPEN_DURATION = 220;
const CLOSE_DURATION = 200;

type SymbolViewName = ComponentProps<typeof SymbolView>['name'];
type PlatformSymbolName = Extract<SymbolViewName, { ios?: unknown }>;

type SettingsOption = {
  id: string;
  label: string;
  subtitle?: string;
  icon: PlatformSymbolName;
};

type HomeMenuSidebarProps = {
  visible: boolean;
  onClose: () => void;
};

function SettingsRow({
  option,
  onPress,
}: {
  option: SettingsOption;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityLabel={option.label}
      onPress={onPress}>
      <View style={styles.rowIcon}>
        <SymbolView name={option.icon} size={20} tintColor={brand.navy} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{option.label}</Text>
        {option.subtitle ? <Text style={styles.rowSubtitle}>{option.subtitle}</Text> : null}
      </View>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={16}
        tintColor={colors.secondaryPlaceholder}
      />
    </Pressable>
  );
}

function SettingsSection({
  title,
  options,
  onOptionPress,
}: {
  title: string;
  options: SettingsOption[];
  onOptionPress?: (option: SettingsOption) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {options.map((option, index) => (
          <View key={option.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <SettingsRow
              option={option}
              onPress={onOptionPress ? () => onOptionPress(option) : undefined}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export function HomeMenuSidebar({ visible, onClose }: HomeMenuSidebarProps) {
  const { user } = useAuth();
  const { locale, t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const isShownRef = useRef(false);
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const generalOptions: SettingsOption[] = [
    {
      id: 'account',
      label: t('settings.account'),
      icon: { ios: 'person.circle', android: 'person', web: 'person' },
    },
    {
      id: 'notifications',
      label: t('settings.notifications'),
      icon: { ios: 'bell', android: 'notifications', web: 'notifications' },
    },
    {
      id: 'language',
      label: t('settings.language'),
      subtitle: LOCALE_LABELS[locale],
      icon: { ios: 'globe', android: 'language', web: 'language' },
    },
  ];

  const supportOptions: SettingsOption[] = [
    {
      id: 'help',
      label: t('settings.help'),
      icon: { ios: 'questionmark.circle', android: 'help', web: 'help' },
    },
    {
      id: 'privacy',
      label: t('settings.privacyPolicy'),
      icon: { ios: 'hand.raised', android: 'privacy_tip', web: 'privacy_tip' },
    },
    {
      id: 'about',
      label: t('settings.about'),
      icon: { ios: 'info.circle', android: 'info', web: 'info' },
    },
  ];

  const generalOptionsWithAccount: SettingsOption[] = generalOptions.map((option) =>
    option.id === 'account'
      ? {
          ...option,
          subtitle: user?.email ?? t('common.signIn'),
        }
      : option,
  );

  useEffect(() => {
    if (visible) {
      translateX.stopAnimation();
      backdropOpacity.stopAnimation();
      isShownRef.current = true;
      setModalVisible(true);
      translateX.setValue(-SIDEBAR_WIDTH);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: OPEN_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: OPEN_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!isShownRef.current) {
      return;
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -SIDEBAR_WIDTH,
        duration: CLOSE_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: CLOSE_DURATION,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        isShownRef.current = false;
        setModalVisible(false);
      }
    });
  }, [visible, translateX, backdropOpacity]);

  function handleClose() {
    onClose();
  }

  function handleOptionPress(option: SettingsOption) {
    handleClose();
    if (option.id === 'account') {
      router.push('/account');
    } else if (option.id === 'language') {
      router.push('/language');
    }
  }

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel={t('common.close')}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View
          style={[styles.panel, { width: SIDEBAR_WIDTH, transform: [{ translateX }] }]}>
          <SafeAreaView style={styles.panelContent} edges={['top', 'bottom', 'left']}>
            <View style={styles.header}>
              <AideyWordmark style={styles.title} />
            </View>

            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              <SettingsSection
                title={t('settings.general')}
                options={generalOptionsWithAccount}
                onOptionPress={handleOptionPress}
              />
              <SettingsSection title={t('settings.support')} options={supportOptions} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 22, 106, 0.35)',
  },
  panel: {
    height: '100%',
    backgroundColor: colors.primary,
    shadowColor: brand.navy,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 32,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    overflow: 'hidden',
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowPressed: {
    opacity: 0.85,
    backgroundColor: colors.secondaryMuted,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  rowSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondaryBorder,
    marginHorizontal: 16,
  },
});
