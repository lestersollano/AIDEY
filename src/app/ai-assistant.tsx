import { Image } from 'expo-image';
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
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { sendMessage, type ChatRole } from '@/services/chat';

type UiChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

type AssistantMood = 'happy' | 'confused';

const MOOD_IMAGES = {
  happy: require('@/assets/images/mgadokumentoatid.png'),
  confused: require('@/assets/images/magpatulongsaai.png'),
} as const;

function getAssistantMood(text: string): AssistantMood {
  const lower = text.trim().toLowerCase();

  if (text.includes('?')) return 'confused';

  const confusedPhrases = [
    'hindi ko sigurado',
    'hindi ko alam',
    'pakilinaw',
    'could you clarify',
    'can you tell me',
    'ano ang',
    'saan ang',
    'paano ang',
    'bakit ang',
  ];

  if (confusedPhrases.some((phrase) => lower.includes(phrase))) return 'confused';

  return 'happy';
}

function AssistantMessage({ text }: { text: string }) {
  const mood = getAssistantMood(text);

  return (
    <View style={styles.assistantMessage}>
      <Image
        source={MOOD_IMAGES[mood]}
        style={styles.assistantAvatar}
        contentFit="contain"
      />
      <View style={[styles.bubble, styles.assistantBubble]}>
        <Text style={[styles.bubbleText, styles.assistantBubbleText]}>{text}</Text>
      </View>
    </View>
  );
}

function AssistantLoadingMessage() {
  return (
    <View style={styles.assistantMessage}>
      <Image
        source={MOOD_IMAGES.confused}
        style={styles.assistantAvatar}
        contentFit="contain"
      />
      <View style={[styles.bubble, styles.assistantBubble, styles.loadingBubble]}>
        <ActivityIndicator size="small" color={brand.teal} />
      </View>
    </View>
  );
}

function createMessage(role: ChatRole, text: string): UiChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    text,
  };
}

function pressableStyle(baseStyle: object, pressedStyle: object) {
  return ({ pressed }: { pressed: boolean }) => [baseStyle, pressed && pressedStyle];
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
              <View style={styles.welcome}>
                <Text style={styles.welcomeGreeting}>Kumusta!</Text>
                <Text style={styles.welcomeText}>
                  Paano kita matutulungan ngayon?
                </Text>
              </View>
            ) : (
              messages.map((item) =>
                item.role === 'user' ? (
                  <View key={item.id} style={styles.messageRow}>
                    <View style={[styles.bubble, styles.userBubble]}>
                      <Text style={[styles.bubbleText, styles.userBubbleText]}>
                        {item.text}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View key={item.id} style={styles.messageRowAssistant}>
                    <AssistantMessage text={item.text} />
                  </View>
                ),
              )
            )}

            {isLoading ? (
              <View style={styles.messageRowAssistant}>
                <AssistantLoadingMessage />
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
                    style={pressableStyle(styles.iconButton, styles.iconButtonPressed)}
                    accessibilityLabel="Speech to text"
                    disabled={isLoading}
                    hitSlop={8}>
                    <SymbolView
                      name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
                      size={22}
                      tintColor={brand.teal}
                    />
                  </Pressable>
                  <Pressable
                    style={pressableStyle(styles.iconButton, styles.iconButtonPressed)}
                    accessibilityLabel="Camera"
                    disabled={isLoading}
                    hitSlop={8}>
                    <SymbolView
                      name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
                      size={22}
                      tintColor={brand.teal}
                    />
                  </Pressable>
                  <Pressable
                    style={pressableStyle(styles.iconButton, styles.iconButtonPressed)}
                    accessibilityLabel="Upload image"
                    disabled={isLoading}
                    hitSlop={8}>
                    <SymbolView
                      name={{ ios: 'photo.fill', android: 'image', web: 'image' }}
                      size={22}
                      tintColor={brand.teal}
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.sendButton,
                    !canSend && styles.sendButtonDisabled,
                    pressed && canSend && styles.sendButtonPressed,
                  ]}
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

const cardShadow = {
  shadowColor: brand.navy,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
} as const;

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
    gap: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messagesContentEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  welcome: {
    alignItems: 'center',
    gap: 8,
  },
  welcomeGreeting: {
    fontFamily: fonts.fredoka,
    fontSize: 28,
    color: brand.blue,
  },
  welcomeText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  assistantMessage: {
    maxWidth: '85%',
    alignItems: 'flex-start',
  },
  assistantAvatar: {
    width: 80,
    height: 80,
    marginLeft: 4,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  userBubble: {
    maxWidth: '80%',
    borderBottomRightRadius: 4,
    backgroundColor: brand.teal,
  },
  assistantBubble: {
    alignSelf: 'stretch',
    borderBottomLeftRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    ...cardShadow,
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
    color: brand.navy,
  },
  composer: {
    paddingTop: 12,
  },
  inputBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
    ...cardShadow,
  },
  input: {
    minHeight: 44,
    maxHeight: 120,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: brand.navy,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(1, 154, 143, 0.08)',
  },
  iconButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.teal,
  },
  sendButtonDisabled: {
    backgroundColor: colors.secondaryBorder,
  },
  sendButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
