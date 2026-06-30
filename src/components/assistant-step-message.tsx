import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { MapActionCard } from '@/components/map-action-card';
import { SuggestedReplies } from '@/components/suggested-replies';
import { TaskCompletionCard } from '@/components/task-completion-card';
import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import type { AideyReply, Suggestion } from '@/types/aidey-response';
import type { UserCoordinates } from '@/utils/maps';

type AssistantMood =
  | 'happy'
  | 'confused'
  | 'celebrating'
  | 'apologetic'
  | 'reassuring';

const MOOD_IMAGES = {
  happy: require('@/assets/images/mascot/mood/happy.png'),
  confused: require('@/assets/images/mascot/mood/confused.png'),
  celebrating: require('@/assets/images/mascot/mood/celebrating.png'),
  apologetic: require('@/assets/images/mascot/mood/apologetic.png'),
  reassuring: require('@/assets/images/mascot/mood/reassuring.png'),
} as const;

function getAssistantMood(text: string): AssistantMood {
  const lower = text.trim().toLowerCase();

  const apologeticPhrases = [
    'pasensya',
    'paumanhin',
    'sorry',
    'hindi ko mahanap',
    'hindi ko makita',
    'walang nahanap',
    'hindi available',
    'hindi po namin',
    'error',
  ];

  if (apologeticPhrases.some((phrase) => lower.includes(phrase))) {
    return 'apologetic';
  }

  const celebratingPhrases = [
    'congrat',
    'salamat',
    'tapos na',
    'nakumpleto',
    'success',
    'natagpuan',
    'andito na',
    'malapit ka na',
  ];

  if (celebratingPhrases.some((phrase) => lower.includes(phrase))) {
    return 'celebrating';
  }

  const reassuringPhrases = [
    'huwag kang mag-alala',
    'okay lang',
    'gagabayan',
    'tutulungan ka',
    'direksyon',
    'punta sa',
    'malapit na opisina',
  ];

  if (reassuringPhrases.some((phrase) => lower.includes(phrase))) {
    return 'reassuring';
  }

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

type AssistantStepMessageProps = {
  reply: AideyReply;
  model?: string;
  suggestionsDisabled?: boolean;
  userLocation?: UserCoordinates;
  onSelectSuggestion?: (suggestion: Suggestion) => void;
  showTaskCompletion?: boolean;
  taskFinished?: boolean;
  documentLabel?: string;
  onFinishTask?: () => void;
  onAddToGallery?: () => void;
};

export function AssistantStepMessage({
  reply,
  model,
  suggestionsDisabled = false,
  userLocation,
  onSelectSuggestion,
  showTaskCompletion = false,
  taskFinished = false,
  documentLabel,
  onFinishTask,
  onAddToGallery,
}: AssistantStepMessageProps) {
  const mood = getAssistantMood(reply.message);
  const stepLabel = reply.step
    ? reply.step.label ?? `Hakbang ${reply.step.current}${reply.step.total ? ` ng ${reply.step.total}` : ''}`
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={MOOD_IMAGES[mood]}
          style={styles.avatar}
          contentFit="contain"
        />
        {model ? <Text style={styles.modelLabel}>{model}</Text> : null}
      </View>

      <View style={styles.bubble}>
        {stepLabel ? (
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{stepLabel}</Text>
          </View>
        ) : null}
        <Text style={styles.message}>{reply.message}</Text>
        {reply.mapDestination ? (
          <MapActionCard
            destination={reply.mapDestination}
            userLocation={userLocation}
          />
        ) : null}
      </View>

      {onSelectSuggestion ? (
        <View style={styles.suggestions}>
          <SuggestedReplies
            suggestions={reply.suggestions}
            disabled={suggestionsDisabled}
            onSelect={onSelectSuggestion}
          />
        </View>
      ) : null}

      {showTaskCompletion && onFinishTask && onAddToGallery ? (
        <TaskCompletionCard
          documentLabel={documentLabel}
          isFinished={taskFinished}
          onFinish={onFinishTask}
          onAddToGallery={onAddToGallery}
        />
      ) : null}
    </View>
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
  container: {
    maxWidth: '92%',
    alignSelf: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
  },
  modelLabel: {
    flexShrink: 1,
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.secondaryPlaceholder,
    marginBottom: 4,
  },
  bubble: {
    alignSelf: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    ...cardShadow,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(1, 154, 143, 0.12)',
  },
  stepBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: brand.teal,
  },
  message: {
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 22,
    color: brand.navy,
  },
  suggestions: {
    alignItems: 'flex-start',
    marginTop: 10,
  },
});
