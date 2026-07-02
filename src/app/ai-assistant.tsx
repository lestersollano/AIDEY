import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssistantStepMessage } from '@/components/assistant-step-message';
import { AideyWordmark } from '@/components/aidey-wordmark';
import { ChatHistorySidebar } from '@/components/chat-history-sidebar';
import { ScreenHeader } from '@/components/screen-header';
import { SpeechToTextButton } from '@/components/speech-to-text-button';
import { SuggestedReplies } from '@/components/suggested-replies';
import { TaskChecklistCard } from '@/components/task-checklist-card';
import { Text, TextInput } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { getDocumentById } from '@/constants/documents';
import { fonts } from '@/constants/fonts';
import {
  AllModelsFailedError,
  sendMessage,
  type ChatRole,
} from '@/services/chat';
import {
  createChatSession,
  getMostRecentOpenSession,
  getChatSession,
  saveChatSession,
  setChatSessionArchived,
  type ChatMessageRecord,
} from '@/services/chat-sessions';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { useAllDocumentGuideProgress } from '@/hooks/use-document-guide-progress';
import { useDocumentUploads } from '@/hooks/use-document-uploads';
import { useLiveUserLocation } from '@/hooks/use-live-user-location';
import {
  buildLocationMessage,
  getUserLocationForAidey,
  LocationPermissionError,
  type UserLocation,
} from '@/services/location';
import {
  enrichReplyWithNearestOffice,
  shouldAutoFetchLocation,
} from '@/services/office-finder';
import {
  createDefaultChecklist,
  createFallbackReply,
  WELCOME_SUGGESTIONS,
  type AideyReply,
  type ChecklistItem,
  type MapDestination,
  type Suggestion,
} from '@/types/aidey-response';
import {
  hasValidInternetConnection,
  markPendingAiUnavailableError,
  markPendingInternetError,
} from '@/utils/internet-connection';
import {
  getActiveMapDestination,
  isMapRelevantInConversation,
  openMapDirections,
} from '@/utils/map-navigation';
import {
  getMapDestinationKey,
  isWithinOfficeProximity,
  type UserCoordinates,
} from '@/utils/maps';

type UiChatMessage = ChatMessageRecord;

const MOOD_IMAGES = {
  thinking: require('@/assets/images/mascot/mood/thinking.png'),
} as const;

function createMessage(
  role: ChatRole,
  text: string,
  structured?: AideyReply,
  model?: string,
  extra?: Partial<UiChatMessage>,
): UiChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    text,
    structured,
    model,
    ...extra,
  };
}

function pressableStyle(baseStyle: object, pressedStyle: object) {
  return ({ pressed }: { pressed: boolean }) => [baseStyle, pressed && pressedStyle];
}

/** Recovers checklist progress from message history for sessions whose
 * top-level checklist field was never populated (e.g. older records saved
 * before that field existed), so resuming never resets real progress. */
function findLastChecklistInMessages(messages: UiChatMessage[]): ChecklistItem[] | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const checklist = messages[i].structured?.checklist;
    if (checklist?.length) return checklist;
  }
  return undefined;
}

function AssistantLoadingMessage() {
  return (
    <View style={styles.assistantLoading}>
      <Image
        source={MOOD_IMAGES.thinking}
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
  const { prompt, documentLabel, documentId } = useLocalSearchParams<{
    prompt?: string;
    documentLabel?: string;
    documentId?: string;
  }>();
  const initialPrompt = typeof prompt === 'string' ? prompt : undefined;
  const initialDocumentLabel =
    typeof documentLabel === 'string' ? documentLabel : undefined;
  const initialDocumentId =
    typeof documentId === 'string' && documentId ? documentId : undefined;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [finishedTaskIds, setFinishedTaskIds] = useState<Set<string>>(new Set());
  const [activeDocumentLabel, setActiveDocumentLabel] = useState<string | undefined>(
    initialDocumentLabel,
  );
  const [activeDocumentId, setActiveDocumentId] = useState<string | undefined>(
    initialDocumentId,
  );
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sessionResumed, setSessionResumed] = useState(false);
  const sessionCreationRef = useRef<Promise<string> | null>(null);
  const chatSessions = useChatSessions();

  const documentUploads = useDocumentUploads();
  const ownedDocumentIds = Object.keys(documentUploads);
  const documentGuideProgress = useAllDocumentGuideProgress();
  const canSend = message.trim().length > 0 && !isLoading;
  const mapIsRelevant = isMapRelevantInConversation(messages);
  const activeMapDestination = getActiveMapDestination(messages);
  const liveUserLocation = useLiveUserLocation(mapIsRelevant);
  const trackedUserLocation = liveUserLocation ?? userLocation ?? undefined;
  const proximityTriggeredRef = useRef<string | null>(null);

  // Resume the most recently active, not-yet-completed conversation so the
  // chat feels persistent across app opens — unless the checklist tied to it
  // is already fully done, in which case we start with a blank chat.
  useEffect(() => {
    let cancelled = false;

    void getMostRecentOpenSession().then((session) => {
      if (cancelled) return;

      if (session) {
        sessionCreationRef.current = Promise.resolve(session.id);
        setCurrentSessionId(session.id);
        setMessages(session.messages);
        setChecklistItems(
          session.checklist.length
            ? session.checklist
            : findLastChecklistInMessages(session.messages) ??
                (session.documentLabel ? createDefaultChecklist(session.documentLabel) : []),
        );
        setActiveDocumentId((current) => current ?? session.documentId);
        setActiveDocumentLabel((current) => current ?? session.documentLabel);
      } else if (initialDocumentLabel) {
        // Seed a checklist immediately so it's visible right away instead of
        // waiting on the AI to decide to include one in its first reply.
        setChecklistItems(createDefaultChecklist(initialDocumentLabel));
      }

      setSessionResumed(true);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messages.length === 0 && checklistItems.length === 0) return;

    if (currentSessionId) {
      void saveChatSession(currentSessionId, { messages, checklist: checklistItems });
      return;
    }

    if (!sessionCreationRef.current) {
      sessionCreationRef.current = createChatSession({
        documentId: activeDocumentId,
        documentLabel: activeDocumentLabel,
      }).then((session) => {
        setCurrentSessionId(session.id);
        return session.id;
      });
    }

    void sessionCreationRef.current.then((id) =>
      saveChatSession(id, { messages, checklist: checklistItems }),
    );
  }, [messages, checklistItems, currentSessionId, activeDocumentId, activeDocumentLabel]);

  // Once every checklist item is done, the conversation is complete — clear
  // the chat shortly after so the next visit (or this one) starts fresh.
  useEffect(() => {
    if (checklistItems.length === 0) return;
    if (!checklistItems.every((item) => item.done)) return;

    const timeout = setTimeout(() => {
      handleNewChat();
    }, 2200);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistItems]);

  const destinationKey = activeMapDestination
    ? getMapDestinationKey(activeMapDestination)
    : null;

  useEffect(() => {
    proximityTriggeredRef.current = null;
  }, [destinationKey]);

  useEffect(() => {
    if (
      !mapIsRelevant ||
      !activeMapDestination ||
      !liveUserLocation ||
      isLoading
    ) {
      return;
    }

    if (!isWithinOfficeProximity(liveUserLocation, activeMapDestination)) {
      return;
    }

    const destinationKey = getMapDestinationKey(activeMapDestination);
    if (!destinationKey || proximityTriggeredRef.current === destinationKey) {
      return;
    }

    proximityTriggeredRef.current = destinationKey;
    void submitArrivalInstructions(activeMapDestination, liveUserLocation);
  }, [
    activeMapDestination,
    isLoading,
    liveUserLocation,
    mapIsRelevant,
    messages,
  ]);

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

  async function submitArrivalInstructions(
    destination: MapDestination,
    currentLocation: UserCoordinates,
  ) {
    if (isLoading) return;

    setIsLoading(true);
    scrollToBottom();

    const history = messages.map(({ role, text: content }) => ({ role, text: content }));
    const arrivalMessage = `Narating ko na ang ${destination.name}. Malapit na ako sa opisina.`;

    try {
      const reply = await sendMessage(history, arrivalMessage, {
        documentLabel: activeDocumentLabel,
        ownedDocumentIds,
        documentGuideProgress,
        checklist: checklistItems.length ? checklistItems : undefined,
        atOfficeProximity: {
          officeName: destination.name,
          officeAddress: destination.address,
        },
      });

      if (reply.checklist?.length) {
        setChecklistItems(reply.checklist);
      }

      setUserLocation((current) =>
        current
          ? { ...current, ...currentLocation }
          : {
              ...currentLocation,
              label: destination.address ?? destination.name,
            },
      );

      const onSiteReply: AideyReply = {
        ...reply,
        mapDestination: undefined,
        needsLocation: false,
        suggestions:
          reply.suggestions.length >= 2
            ? reply.suggestions.filter((suggestion) => suggestion.action !== 'open_maps')
            : reply.suggestions,
      };

      setMessages((current) => [
        ...current,
        createMessage('assistant', onSiteReply.message, onSiteReply, reply.model, {
          isArrivalCheck: true,
        }),
      ]);
    } catch (error) {
      proximityTriggeredRef.current = null;

      if (error instanceof AllModelsFailedError) {
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

  async function submitMessage(
    text: string,
    options?: { userLocation?: UserLocation },
  ) {
    if (isLoading) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = createMessage('user', trimmed);
    const history = messages.map(({ role, text: content }) => ({ role, text: content }));
    let locationForOfficeLookup = options?.userLocation ?? userLocation;

    setMessages((current) => [...current, userMessage]);
    setMessage('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const reply = await sendMessage(history, trimmed, {
        documentLabel: activeDocumentLabel,
        ownedDocumentIds,
        documentGuideProgress,
        checklist: checklistItems.length ? checklistItems : undefined,
      });

      if (reply.checklist?.length) {
        setChecklistItems(reply.checklist);
      }

      const officeContext = {
        userMessage: trimmed,
        userLocation: locationForOfficeLookup ?? undefined,
        documentLabel: activeDocumentLabel,
        history,
      };

      if (
        !locationForOfficeLookup &&
        shouldAutoFetchLocation(officeContext, reply)
      ) {
        try {
          locationForOfficeLookup = await getUserLocationForAidey();
          setUserLocation(locationForOfficeLookup);
          officeContext.userLocation = locationForOfficeLookup;
        } catch {
          // Continue without GPS; reply may still ask for location manually.
        }
      }

      const enrichedReply = await enrichReplyWithNearestOffice(reply, officeContext);
      setMessages((current) => [
        ...current,
        createMessage('assistant', enrichedReply.message, enrichedReply, reply.model),
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
    let location: UserLocation;

    try {
      location = await getUserLocationForAidey();
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
    await submitMessage(locationMessage, { userLocation: location });
  }

  function handleOpenMaps() {
    if (!activeMapDestination) return;

    openMapDirections(activeMapDestination, trackedUserLocation);
  }

  function handleFinishTask(messageId: string) {
    setFinishedTaskIds((current) => {
      const next = new Set(current);
      next.add(messageId);
      return next;
    });
  }

  function handleAddToGallery() {
    // Gallery is not functional yet — adding documents will be wired up later.
  }

  function handleNewChat() {
    sessionCreationRef.current = null;
    setCurrentSessionId(null);
    setMessages([]);
    setChecklistItems([]);
    setFinishedTaskIds(new Set());
    setActiveDocumentId(undefined);
    setActiveDocumentLabel(undefined);
    setSidebarVisible(false);
  }

  async function handleSelectSession(sessionId: string) {
    const session = await getChatSession(sessionId);
    if (!session) return;

    sessionCreationRef.current = Promise.resolve(session.id);
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setChecklistItems(session.checklist);
    setActiveDocumentId(session.documentId);
    setActiveDocumentLabel(session.documentLabel);
    setFinishedTaskIds(new Set());
    setSidebarVisible(false);
  }

  async function handleArchiveSession(sessionId: string, archived: boolean) {
    await setChatSessionArchived(sessionId, archived);

    if (archived && sessionId === currentSessionId) {
      handleNewChat();
    }
  }

  function handleToggleChecklistItem(itemId: string, done: boolean) {
    setChecklistItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, done } : item)),
    );
  }

  async function handleSuggestionSelect(suggestion: Suggestion) {
    if (isLoading) return;

    if (suggestion.action === 'share_location') {
      await handleShareLocation();
      return;
    }

    if (suggestion.action === 'open_maps') {
      handleOpenMaps();
      return;
    }

    if (suggestion.action === 'save_document') {
      const document = getDocumentById(suggestion.value);
      if (document) {
        router.push(`/documents/${document.id}/mayroon`);
        return;
      }
    }

    await submitMessage(suggestion.value);
  }

  useEffect(() => {
    if (!connectionChecked || !sessionResumed || !initialPrompt || autoSentRef.current) return;

    autoSentRef.current = true;
    void submitMessage(initialPrompt);
  }, [connectionChecked, sessionResumed, initialPrompt]);

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
        right={
          <Pressable
            style={pressableStyle(styles.menuButton, styles.menuButtonPressed)}
            accessibilityLabel="Menu"
            onPress={() => setSidebarVisible(true)}
            hitSlop={8}>
            <SymbolView
              name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }}
              size={22}
              tintColor={colors.secondary}
            />
          </Pressable>
        }
      />

      <ChatHistorySidebar
        visible={sidebarVisible}
        sessions={chatSessions}
        activeSessionId={currentSessionId}
        onClose={() => setSidebarVisible(false)}
        onNewChat={handleNewChat}
        onSelectSession={(sessionId) => void handleSelectSession(sessionId)}
        onArchiveSession={(sessionId, archived) =>
          void handleArchiveSession(sessionId, archived)
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="translate-with-padding"
        automaticOffset>
        <View style={styles.content}>
          {checklistItems.length > 0 ? (
            <View style={styles.checklistWrapper}>
              <TaskChecklistCard
                items={checklistItems}
                onToggleItem={handleToggleChecklistItem}
              />
            </View>
          ) : null}

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
                    align="center"
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
                        suggestionsDisabled={isLoading}
                        userLocation={trackedUserLocation}
                        onSelectSuggestion={
                          isLatestAssistant
                            ? (suggestion) => void handleSuggestionSelect(suggestion)
                            : undefined
                        }
                        showTaskCompletion={!!item.isArrivalCheck && isLatestAssistant}
                        taskFinished={finishedTaskIds.has(item.id)}
                        documentLabel={activeDocumentLabel}
                        onFinishTask={() => handleFinishTask(item.id)}
                        onAddToGallery={handleAddToGallery}
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
                  <SpeechToTextButton
                    style={styles.iconButton}
                    pressedStyle={styles.iconButtonPressed}
                    iconColor={brand.teal}
                    disabled={isLoading}
                    onTranscript={(transcript) =>
                      setMessage((current) =>
                        current ? `${current} ${transcript}` : transcript,
                      )
                    }
                    onError={(errorMessage) => {
                      setMessages((current) => [
                        ...current,
                        createMessage(
                          'assistant',
                          errorMessage,
                          createFallbackReply(errorMessage),
                        ),
                      ]);
                    }}
                  />
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonPressed: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  checklistWrapper: {
    paddingTop: 12,
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
