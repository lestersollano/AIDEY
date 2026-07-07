import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/text';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { isChecklistComplete, type ChatSessionSummary } from '@/services/chat-sessions';

const SIDEBAR_WIDTH = Math.min(320, Dimensions.get('window').width * 0.82);

const OPEN_DURATION = 220;
const CLOSE_DURATION = 200;
const OPEN_EASING = Easing.out(Easing.cubic);
const CLOSE_EASING = Easing.in(Easing.cubic);

type ListRow =
  | { type: 'session'; session: ChatSessionSummary }
  | { type: 'archivedHeader'; count: number };

type ChatHistorySidebarProps = {
  visible: boolean;
  sessions: ChatSessionSummary[];
  activeSessionId?: string | null;
  onClose: () => void;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onArchiveSession: (sessionId: string, archived: boolean) => void;
};

export function ChatHistorySidebar({
  visible,
  sessions,
  activeSessionId,
  onClose,
  onNewChat,
  onSelectSession,
  onArchiveSession,
}: ChatHistorySidebarProps) {
  const { t } = useTranslation();
  const translateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  const activeSessions = useMemo(
    () => sessions.filter((session) => !session.archived),
    [sessions],
  );
  const archivedSessions = useMemo(
    () => sessions.filter((session) => session.archived),
    [sessions],
  );

  const rows: ListRow[] = useMemo(() => {
    const result: ListRow[] = activeSessions.map((session) => ({ type: 'session', session }));
    if (archivedSessions.length > 0) {
      result.push({ type: 'archivedHeader', count: archivedSessions.length });
      if (archivedExpanded) {
        for (const session of archivedSessions) {
          result.push({ type: 'session', session });
        }
      }
    }
    return result;
  }, [activeSessions, archivedSessions, archivedExpanded]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: OPEN_DURATION,
          easing: OPEN_EASING,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: OPEN_DURATION,
          easing: OPEN_EASING,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: SIDEBAR_WIDTH,
          duration: CLOSE_DURATION,
          easing: CLOSE_EASING,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: CLOSE_DURATION,
          easing: CLOSE_EASING,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, backdropOpacity]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityLabel={t('common.close')} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[styles.panel, { width: SIDEBAR_WIDTH, transform: [{ translateX }] }]}>
          <SafeAreaView style={styles.panelContent} edges={['top', 'bottom', 'right']}>
            <Pressable
              style={({ pressed }) => [styles.backRow, pressed && styles.backRowPressed]}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              onPress={onClose}>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'arrow_forward', web: 'arrow_forward' }}
                size={20}
                tintColor={colors.secondary}
              />
              <Text style={styles.backText}>{t('common.back')}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.newChatButton, pressed && styles.newChatButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel={t('ai.newChat')}
              onPress={onNewChat}>
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                size={18}
                tintColor={colors.primary}
              />
              <Text style={styles.newChatText}>{t('ai.newChat')}</Text>
            </Pressable>

            <FlatList
              style={styles.list}
              contentContainerStyle={styles.listContent}
              data={rows}
              keyExtractor={(row, index) =>
                row.type === 'session' ? row.session.id : `archived-header-${index}`
              }
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>{t('ai.noChats')}</Text>
              }
              renderItem={({ item: row }) => {
                if (row.type === 'archivedHeader') {
                  return (
                    <Pressable
                      style={({ pressed }) => [
                        styles.archivedHeaderRow,
                        pressed && styles.sessionRowPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={
                        archivedExpanded ? t('ai.collapseArchived') : t('ai.expandArchived')
                      }
                      accessibilityState={{ expanded: archivedExpanded }}
                      onPress={() => setArchivedExpanded((current) => !current)}>
                      <SymbolView
                        name={{ ios: 'archivebox', android: 'archive', web: 'archive' }}
                        size={15}
                        tintColor={colors.secondary}
                      />
                      <Text style={styles.archivedHeaderText}>
                        {t('ai.archived', { count: row.count })}
                      </Text>
                      <SymbolView
                        name={{
                          ios: archivedExpanded ? 'chevron.up' : 'chevron.down',
                          android: archivedExpanded ? 'expand_less' : 'expand_more',
                          web: archivedExpanded ? 'expand_less' : 'expand_more',
                        }}
                        size={14}
                        tintColor={colors.secondary}
                      />
                    </Pressable>
                  );
                }

                const item = row.session;
                const isActive = item.id === activeSessionId;
                const isDone = isChecklistComplete(item.checklist);
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.sessionRow,
                      isActive && styles.sessionRowActive,
                      pressed && styles.sessionRowPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                    onPress={() => onSelectSession(item.id)}>
                    <SymbolView
                      name={{
                        ios: 'bubble.left',
                        android: 'chat_bubble_outline',
                        web: 'chat_bubble_outline',
                      }}
                      size={16}
                      tintColor={isActive ? brand.teal : colors.secondaryPlaceholder}
                    />
                    <Text
                      style={[
                        styles.sessionTitle,
                        isActive && styles.sessionTitleActive,
                        item.archived && styles.sessionTitleArchived,
                      ]}
                      numberOfLines={1}>
                      {item.title}
                    </Text>
                    {isDone ? (
                      <SymbolView
                        name={{
                          ios: 'checkmark.circle.fill',
                          android: 'check_circle',
                          web: 'check_circle',
                        }}
                        size={15}
                        tintColor={brand.teal}
                      />
                    ) : null}
                    <Pressable
                      style={({ pressed }) => [
                        styles.archiveButton,
                        pressed && styles.archiveButtonPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={
                        item.archived ? t('ai.unarchiveChat') : t('ai.archiveChat')
                      }
                      hitSlop={8}
                      onPress={(event) => {
                        event.stopPropagation();
                        onArchiveSession(item.id, !item.archived);
                      }}>
                      <SymbolView
                        name={{
                          ios: item.archived ? 'arrow.uturn.up' : 'archivebox',
                          android: item.archived ? 'unarchive' : 'archive',
                          web: item.archived ? 'unarchive' : 'archive',
                        }}
                        size={15}
                        tintColor={colors.secondaryPlaceholder}
                      />
                    </Pressable>
                  </Pressable>
                );
              }}
            />
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
    justifyContent: 'flex-end',
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
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  backRowPressed: {
    opacity: 0.7,
  },
  backText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: brand.teal,
    marginTop: 4,
  },
  newChatButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  newChatText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
  listContent: {
    gap: 2,
    paddingBottom: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.secondaryPlaceholder,
    textAlign: 'center',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  sessionRowActive: {
    backgroundColor: 'rgba(1, 154, 143, 0.1)',
  },
  sessionRowPressed: {
    backgroundColor: colors.secondaryMuted,
  },
  sessionTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: brand.navy,
  },
  sessionTitleActive: {
    fontFamily: fonts.semiBold,
    color: brand.teal,
  },
  sessionTitleArchived: {
    color: colors.secondaryPlaceholder,
  },
  archiveButton: {
    padding: 6,
    borderRadius: 8,
  },
  archiveButtonPressed: {
    backgroundColor: colors.secondaryMuted,
  },
  archivedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryBorder,
  },
  archivedHeaderText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
});
