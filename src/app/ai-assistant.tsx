import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Text, TextInput } from '@/components/text';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type ChatMessage = {
  id: string;
  text: string;
};

export default function AiAssistantScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const canSend = message.trim().length > 0;

  function handleSend() {
    const text = message.trim();
    if (!text) return;

    setMessages((current) => [...current, { id: Date.now().toString(), text }]);
    setMessage('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader title="Magpatulong sa AI" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <View style={styles.content}>
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={[
              styles.messagesContent,
              messages.length === 0 && styles.messagesContentEmpty,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {messages.length === 0 ? (
              <Text style={styles.welcomeText}>
                Paano kita matutulungan ngayon?
              </Text>
            ) : (
              messages.map((item) => (
                <View key={item.id} style={styles.messageRow}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{item.text}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="I-type ang tanong mo dito..."
                placeholderTextColor={colors.secondaryPlaceholder}
                value={message}
                onChangeText={setMessage}
                multiline
                textAlignVertical="top"
              />

              <View style={styles.toolbar}>
                <View style={styles.toolbarLeft}>
                  <Pressable
                    style={styles.iconButton}
                    accessibilityLabel="Speech to text"
                    hitSlop={8}>
                    <SymbolView
                      name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
                      size={22}
                      tintColor={colors.secondary}
                    />
                  </Pressable>
                  <Pressable
                    style={styles.iconButton}
                    accessibilityLabel="Camera"
                    hitSlop={8}>
                    <SymbolView
                      name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
                      size={22}
                      tintColor={colors.secondary}
                    />
                  </Pressable>
                  <Pressable
                    style={styles.iconButton}
                    accessibilityLabel="Upload image"
                    hitSlop={8}>
                    <SymbolView
                      name={{ ios: 'photo.fill', android: 'image', web: 'image' }}
                      size={22}
                      tintColor={colors.secondary}
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                  accessibilityLabel="Send message"
                  disabled={!canSend}
                  onPress={handleSend}
                  hitSlop={8}>
                  <SymbolView
                    name={{ ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' }}
                    size={20}
                    tintColor={canSend ? colors.primary : colors.secondaryPlaceholder}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    gap: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messagesContentEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: fonts.regular,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    backgroundColor: colors.secondary,
  },
  userBubbleText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.primary,
    lineHeight: 22,
  },
  composer: {
    paddingTop: 12,
  },
  inputBox: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryMuted,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  input: {
    minHeight: 44,
    maxHeight: 120,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.secondary,
    backgroundColor: 'transparent',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.secondaryBorder,
  },
});
