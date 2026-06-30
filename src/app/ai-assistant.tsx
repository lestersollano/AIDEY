import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssistantStepMessage } from '@/components/assistant-step-message';
import { AideyWordmark } from '@/components/aidey-wordmark';
import { ScreenHeader } from '@/components/screen-header';
import { SuggestedReplies } from '@/components/suggested-replies';
import { Text, TextInput } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import {
  AllModelsFailedError,
  sendMessage,
  type ChatRole,
} from '@/services/chat';
import {
  buildLocationMessage,
  getUserLocationForAidey,
  LocationPermissionError,
  type UserLocation,
} from '@/services/location';
import {
  createFallbackReply,
  WELCOME_SUGGESTIONS,
  type AideyReply,
  type Suggestion,
} from '@/types/aidey-response';
import {
  hasValidInternetConnection,
  markPendingAiUnavailableError,
  markPendingInternetError,
} from '@/utils/internet-connection';
import { buildMapsDirectionsUrl } from '@/utils/maps';

type UiChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  structured?: AideyReply;
  model?: string;
};

const MOOD_IMAGES = {
  confused: require('@/assets/images/mascot/cropped/magpatulongsaai.png'),
} as const;

function createMessage(
  role: ChatRole,
  text: string,
  structured?: AideyReply,
  model?: string,
): UiChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    text,
    structured,
    model,
  };
}

function pressableStyle(baseStyle: object, pressedStyle: object) {
  return ({ pressed }: { pressed: boolean }) => [baseStyle, pressed && pressedStyle];
}

function AssistantLoadingMessage() {
  return (
    <View style={styles.assistantLoading}>
      <Image
        source={MOOD_IMAGES.confused}
        style={styles.loadingAvatar}
        contentFit="contain"
      />
      <View style={[styles.bubble, styles.assistantBubble, styles.loadingBubble]}>
        <ActivityIndicator size="small" color={brand.teal} />
      </View>
    </View>
  );
}

export default function AiAssistantScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const autoSentRef = useRef(false);
  const { prompt, documentLabel } = useLocalSearchParams<{
    prompt?: string;
    documentLabel?: string;
  }>();
  const initialPrompt = typeof prompt === 'string' ? prompt : undefined;
  const sessionDocumentLabel =
    typeof documentLabel === 'string' ? documentLabel : undefined;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const canSend = message.trim().length > 0 && !isLoading;

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((item) => item.role === 'assistant' && item.structured);
  const activeSuggestions = lastAssistantMessage?.structured?.suggestions;
  const lastMapDestination = [...messages]
    .reverse()
    .find((item) => item.structured?.mapDestination)?.structured?.mapDestination;

  useEffect(() => {
    let cancelled = false;

    async function checkConnectionOnce() {
      const isConnected = await hasValidInternetConnection();

      if (cancelled) return;

      if (!isConnected) {
        markPendingInternetError();
        router.back();
        return;
      }

      setConnectionChecked(true);
    }

    checkConnectionOnce();

    return () => {
      cancelled = true;
    };
  }, []);

  function scrollToBottom() {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }

  async function submitMessage(text: string) {
    if (isLoading) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = createMessage('user', trimmed);
    const history = messages.map(({ role, text: content }) => ({ role, text: content }));

    setMessages((current) => [...current, userMessage]);
    setMessage('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const reply = await sendMessage(history, trimmed, {
        documentLabel: sessionDocumentLabel,
      });
      setMessages((current) => [
        ...current,
        createMessage('assistant', reply.message, reply, reply.model),
      ]);
    } catch (error) {
      if (error instanceof AllModelsFailedError) {
        setMessages((current) => current.filter((item) => item.id !== userMessage.id));
        markPendingAiUnavailableError();
        router.back();
        return;
      }

      const errorText =
        error instanceof Error ? error.message : 'May naganap na error. Subukan muli.';
      setMessages((current) => [
        ...current,
        createMessage('assistant', errorText, createFallbackReply(errorText)),
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }

  async function handleShareLocation() {
    if (isLoading) return;

    setIsLoading(true);
    let locationMessage: string;

    try {
      const location = await getUserLocationForAidey();
      setUserLocation(location);
      locationMessage = buildLocationMessage(location);
    } catch (error) {
      const errorText =
        error instanceof LocationPermissionError
          ? error.message
          : 'Hindi makuha ang lokasyon. Subukan muli o i-type ang iyong lungsod.';
      setMessages((current) => [
        ...current,
        createMessage('assistant', errorText, createFallbackReply(errorText)),
      ]);
      setIsLoading(false);
      scrollToBottom();
      return;
    }

    setIsLoading(false);
    await submitMessage(locationMessage);
  }

  async function handleOpenMaps() {
    if (!lastMapDestination) return;

    const url = buildMapsDirectionsUrl(
      lastMapDestination,
      userLocation ?? undefined,
    );
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  }

  async function handleSuggestionSelect(suggestion: Suggestion) {
    if (isLoading) return;

    if (suggestion.action === 'share_location') {
      await handleShareLocation();
      return;
    }

    if (suggestion.action === 'open_maps') {
      await handleOpenMaps();
      return;
    }

    await submitMessage(suggestion.value);
  }

  useEffect(() => {
    if (!connectionChecked || !initialPrompt || autoSentRef.current) return;

    autoSentRef.current = true;
    void submitMessage(initialPrompt);
  }, [connectionChecked, initialPrompt]);

  async function handleSend() {
    await submitMessage(message);
  }

  if (!connectionChecked) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScreenHeader
          title={<AideyWordmark style={styles.headerTitle} suffix=" AI" />}
        />
        <View style={styles.connectionCheck}>
          <ActivityIndicator size="large" color={brand.teal} />
        </View>
      </SafeAreaView>
    );
  }

  const showWelcome = messages.length === 0 && !isLoading;

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
              showWelcome && styles.messagesContentEmpty,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {showWelcome ? (
              <View style={styles.welcome}>
                <Text style={styles.welcomeGreeting}>Kumusta!</Text>
                <Text style={styles.welcomeText}>
                  Gabayan kita hakbang-hakbang sa dokumento o ID na kailangan mo.
                </Text>
                <View style={styles.welcomeSuggestions}>
                  <SuggestedReplies
                    suggestions={WELCOME_SUGGESTIONS}
                    onSelect={(suggestion) => void handleSuggestionSelect(suggestion)}
                  />
                </View>
              </View>
            ) : (
              messages.map((item, index) => {
                const isLatestAssistant =
                  item.role === 'assistant' &&
                  index === messages.findLastIndex((msg) => msg.role === 'assistant');

                return item.role === 'user' ? (
                  <View key={item.id} style={styles.messageRow}>
                    <View style={[styles.bubble, styles.userBubble]}>
                      <Text style={[styles.bubbleText, styles.userBubbleText]}>
                        {item.text}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View key={item.id} style={styles.messageRowAssistant}>
                    {item.structured ? (
                      <AssistantStepMessage
                        reply={item.structured}
                        model={item.model}
                        suggestionsDisabled={!isLatestAssistant || isLoading}
                        userLocation={userLocation ?? undefined}
                        onSelectSuggestion={(suggestion) =>
                          void handleSuggestionSelect(suggestion)
                        }
                      />
                    ) : (
                      <View style={[styles.bubble, styles.assistantBubble]}>
                        <Text style={[styles.bubbleText, styles.assistantBubbleText]}>
                          {item.text}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}

            {isLoading ? (
              <View style={styles.messageRowAssistant}>
                <AssistantLoadingMessage />
              </View>
            ) : null}
          </ScrollView>

          {!showWelcome && activeSuggestions && activeSuggestions.length > 0 ? (
            <View style={styles.stickySuggestions}>
              <SuggestedReplies
                suggestions={activeSuggestions}
                disabled={isLoading}
                onSelect={(suggestion) => void handleSuggestionSelect(suggestion)}
              />
            </View>
          ) : null}

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
                  onPress={() => void handleSend()}
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
  connectionCheck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 12,
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
  welcomeSuggestions: {
    marginTop: 8,
    width: '100%',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  assistantLoading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  loadingAvatar: {
    width: 80,
    height: 80,
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
    maxWidth: '85%',
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
  stickySuggestions: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryBorder,
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
