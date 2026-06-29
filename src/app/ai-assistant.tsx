import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AideyWordmark } from '@/components/aidey-wordmark';
import { ScreenHeader } from '@/components/screen-header';
import { Text, TextInput } from '@/components/text';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { sendMessage, type ChatRole } from '@/services/chat';

type UiChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

function createMessage(role: ChatRole, text: string): UiChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    text,
  };
}

export default function AiAssistantScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const canSend = message.trim().length > 0 && !isLoading;

  function scrollToBottom() {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }

  async function handleSend() {
    const text = message.trim();
    if (!text || isLoading) return;

    const userMessage = createMessage('user', text);
    const history = messages.map(({ role, text: content }) => ({ role, text: content }));

    setMessages((current) => [...current, userMessage]);
    setMessage('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const reply = await sendMessage(history, text);
      setMessages((current) => [...current, createMessage('assistant', reply)]);
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : 'May naganap na error. Subukan muli.';
      setMessages((current) => [...current, createMessage('assistant', errorText)]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={<AideyWordmark style={styles.headerTitle} suffix=" AI" />}
      />

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
              messages.length === 0 && !isLoading && styles.messagesContentEmpty,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {messages.length === 0 && !isLoading ? (
              <Text style={styles.welcomeText}>
                Paano kita matutulungan ngayon?
              </Text>
            ) : (
              messages.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.messageRow,
                    item.role === 'assistant' && styles.messageRowAssistant,
                  ]}>
                  <View
                    style={[
                      styles.bubble,
                      item.role === 'user' ? styles.userBubble : styles.assistantBubble,
                    ]}>
                    <Text
                      style={[
                        styles.bubbleText,
                        item.role === 'user' ? styles.userBubbleText : styles.assistantBubbleText,
                      ]}>
                      {item.text}
                    </Text>
                  </View>
                </View>
              ))
            )}

            {isLoading ? (
              <View style={[styles.messageRow, styles.messageRowAssistant]}>
                <View style={[styles.bubble, styles.assistantBubble, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color={colors.secondary} />
                </View>
              </View>
            ) : null}
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
                editable={!isLoading}
                textAlignVertical="top"
              />

              <View style={styles.toolbar}>
                <View style={styles.toolbarLeft}>
                  <Pressable
                    style={styles.iconButton}
                    accessibilityLabel="Speech to text"
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
  headerTitle: {
    fontSize: 17,
    textAlign: 'center',
  },
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
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    backgroundColor: colors.secondary,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    backgroundColor: colors.secondaryMuted,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
  },
  loadingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  bubbleText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 22,
  },
  userBubbleText: {
    color: colors.primary,
  },
  assistantBubbleText: {
    color: colors.secondary,
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
