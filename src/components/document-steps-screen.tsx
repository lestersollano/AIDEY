import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccordionSection } from '@/components/accordion-section';
import { DocumentUploadPanel } from '@/components/document-upload-panel';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import {
  getDocumentGuide,
  getRequirementLabel,
  isDependencyRequirement,
  type DocumentRequirementItem,
} from '@/constants/document-guides';
import { getDocumentById } from '@/constants/documents';
import { fonts } from '@/constants/fonts';
import { useDocumentGuideProgress } from '@/hooks/use-document-guide-progress';
import { useDocumentUploads } from '@/hooks/use-document-uploads';
import type { DocumentGuideSection } from '@/services/document-guide-progress';
import type { DocumentImageRecord } from '@/services/document-uploads';

type DocumentStepsScreenProps = {
  documentId: string;
  title: string;
};

const SECTION_ORDER: DocumentGuideSection[] = ['requirements', 'steps', 'upload'];

export function DocumentStepsScreen({ documentId, title }: DocumentStepsScreenProps) {
  const guide = getDocumentGuide(documentId);
  const { progress, isLoaded, toggleRequirement, toggleStep, completeSection } =
    useDocumentGuideProgress(documentId);
  const uploadsByDocument = useDocumentUploads();

  const [expandedSection, setExpandedSection] = useState<DocumentGuideSection | null>('requirements');
  const [uploadedImages, setUploadedImages] = useState<DocumentImageRecord[]>([]);
  const didInitExpandedSection = useRef(false);

  useEffect(() => {
    if (!isLoaded || didInitExpandedSection.current) return;
    didInitExpandedSection.current = true;

    const nextIncomplete = SECTION_ORDER.find(
      (section) => !progress.completedSections.includes(section),
    );
    setExpandedSection(nextIncomplete ?? 'upload');
  }, [isLoaded, progress.completedSections]);

  const isRequirementsDone = progress.completedSections.includes('requirements');
  const isStepsDone = progress.completedSections.includes('steps');
  const isUploadDone = progress.completedSections.includes('upload');
  const isAllDone = isRequirementsDone && isStepsDone && isUploadDone;

  const stepsCheckedCount = progress.checkedSteps.length;

  /** For a dependency requirement, other catalog documents (besides itself)
   * that would satisfy it — and whether the user already has any of them
   * (has at least one photo saved for that document elsewhere in Aidey). */
  const getDependencyStatus = useCallback(
    (item: DocumentRequirementItem) => {
      if (!isDependencyRequirement(item)) return null;

      const otherDocumentIds = item.documentIds.filter((id) => id !== documentId);
      const satisfied = otherDocumentIds.some((id) => (uploadsByDocument[id]?.length ?? 0) > 0);
      return { otherDocumentIds, satisfied };
    },
    [documentId, uploadsByDocument],
  );

  const isRequirementSatisfied = useCallback(
    (item: DocumentRequirementItem, index: number) => {
      const dependency = getDependencyStatus(item);
      if (dependency?.satisfied) return true;
      return progress.checkedRequirements.includes(index);
    },
    [getDependencyStatus, progress.checkedRequirements],
  );

  const requirementsSatisfiedCount = useMemo(
    () => (guide ? guide.requirements.filter((item, index) => isRequirementSatisfied(item, index)).length : 0),
    [guide, isRequirementSatisfied],
  );

  const hasAutoSatisfiedDependency = useMemo(
    () => (guide ? guide.requirements.some((item) => getDependencyStatus(item)?.satisfied) : false),
    [guide, getDependencyStatus],
  );

  const handleToggleSection = useCallback((section: DocumentGuideSection) => {
    setExpandedSection((current) => (current === section ? null : section));
  }, []);

  const handleFinishSection = useCallback(
    (section: DocumentGuideSection, nextSection: DocumentGuideSection | null) => {
      completeSection(section);
      setExpandedSection(nextSection);
    },
    [completeSection],
  );

  // If everything the user needs to prepare is already covered by documents
  // they've obtained elsewhere in Aidey, skip the manual "Tapos" tap and
  // unlock the next section automatically.
  useEffect(() => {
    if (!isLoaded || !guide || isRequirementsDone) return;
    if (!hasAutoSatisfiedDependency) return;
    if (requirementsSatisfiedCount < guide.requirements.length) return;

    handleFinishSection('requirements', 'steps');
  }, [isLoaded, guide, isRequirementsDone, hasAutoSatisfiedDependency, requirementsSatisfiedCount, handleFinishSection]);

  const handleFinishRequirements = useCallback(() => {
    if (!guide || requirementsSatisfiedCount < guide.requirements.length) {
      Alert.alert('Kulang pa', 'Tsekan muna ang lahat ng kinakailangan bago magpatuloy.');
      return;
    }

    handleFinishSection('requirements', 'steps');
  }, [guide, requirementsSatisfiedCount, handleFinishSection]);

  const handleFinishSteps = useCallback(() => {
    if (!guide || stepsCheckedCount < guide.steps.length) {
      Alert.alert('Kulang pa', 'Tsekan muna ang lahat ng hakbang na natapos mo bago magpatuloy.');
      return;
    }

    handleFinishSection('steps', 'upload');
  }, [guide, stepsCheckedCount, handleFinishSection]);

  const handleFinishUpload = useCallback(() => {
    if (uploadedImages.length === 0) {
      Alert.alert(
        'Wala pang larawan',
        'Mag-upload muna ng kuha o larawan ng iyong dokumento bago tapusin.',
      );
      return;
    }

    handleFinishSection('upload', null);
  }, [uploadedImages, handleFinishSection]);

  if (!guide) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={<Text style={styles.headerTitle}>{title}</Text>} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Wala pang detalyadong gabay para dito. Subukan ang Aidey AI Assistant para sa tulong.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={<Text style={styles.headerTitle}>{title}</Text>} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isAllDone ? (
          <View style={styles.completeBanner}>
            <Image
              source={require('@/assets/images/mascot/cropped/id_mayroon.png')}
              style={styles.completeMascot}
              contentFit="contain"
            />
            <Text style={styles.completeTitle}>Handa ka na!</Text>
            <Text style={styles.completeMessage}>
              Nakumpleto mo na ang hakbang-hakbang para sa {title}. Puwede mo na itong dalhin sa
              opisina.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.completeButton, pressed && styles.completeButtonPressed]}
              accessibilityRole="button"
              onPress={() => router.back()}>
              <Text style={styles.completeButtonText}>Bumalik</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.intro}>
            Sundan ang tatlong hakbang na ito nang paisa-isa. Kumpletuhin ang isang seksyon para
            mabuksan ang susunod.
          </Text>
        )}

        <AccordionSection
          index={1}
          title="Mga Kinakailangan"
          subtitle={`${requirementsSatisfiedCount}/${guide.requirements.length} natsek`}
          completed={isRequirementsDone}
          expanded={expandedSection === 'requirements'}
          onToggle={() => handleToggleSection('requirements')}>
          <View style={styles.checklist}>
            {guide.requirements.map((item, index) => {
              const label = getRequirementLabel(item);
              const dependency = getDependencyStatus(item);
              const isChecked = isRequirementSatisfied(item, index);
              const isAuto = Boolean(dependency?.satisfied);
              const missingDocument = dependency && !dependency.satisfied
                ? getDocumentById(dependency.otherDocumentIds[0] ?? '')
                : undefined;

              return (
                <View key={label}>
                  <Pressable
                    style={({ pressed }) => [styles.checklistRow, pressed && !isAuto && styles.checklistRowPressed]}
                    disabled={isAuto}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isChecked, disabled: isAuto }}
                    onPress={() => toggleRequirement(index)}>
                    <SymbolView
                      name={{
                        ios: isChecked ? 'checkmark.circle.fill' : 'circle',
                        android: isChecked ? 'check_circle' : 'radio_button_unchecked',
                        web: isChecked ? 'check_circle' : 'radio_button_unchecked',
                      }}
                      size={20}
                      tintColor={isChecked ? brand.teal : colors.secondaryPlaceholder}
                    />
                    <View style={styles.checklistTextWrapper}>
                      <Text style={[styles.checklistLabel, isChecked && styles.checklistLabelDone]}>
                        {label}
                      </Text>
                      {isAuto ? (
                        <Text style={styles.autoBadge}>Mayroon ka na nito sa Aidey</Text>
                      ) : null}
                    </View>
                  </Pressable>

                  {missingDocument ? (
                    <Pressable
                      style={({ pressed }) => [styles.dependencyLink, pressed && styles.dependencyLinkPressed]}
                      accessibilityRole="button"
                      onPress={() => router.push(`/documents/${missingDocument.id}`)}>
                      <SymbolView
                        name={{ ios: 'arrow.turn.down.right', android: 'subdirectory_arrow_right', web: 'subdirectory_arrow_right' }}
                        size={14}
                        tintColor={brand.teal}
                      />
                      <Text style={styles.dependencyLinkText}>Kunin muna: {missingDocument.label}</Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>

          <Pressable
            style={({ pressed }) => [styles.doneButton, pressed && styles.doneButtonPressed]}
            accessibilityRole="button"
            onPress={handleFinishRequirements}>
            <Text style={styles.doneButtonText}>Tapos na, may dala na ako</Text>
            <SymbolView
              name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
              size={16}
              tintColor={colors.primary}
            />
          </Pressable>
        </AccordionSection>

        <AccordionSection
          index={2}
          title="Mga Hakbang"
          subtitle={
            isStepsDone
              ? `${stepsCheckedCount}/${guide.steps.length} tapos`
              : `Tinatayang tagal: ${guide.timeline}`
          }
          locked={!isRequirementsDone}
          completed={isStepsDone}
          expanded={expandedSection === 'steps'}
          onToggle={() => handleToggleSection('steps')}>
          <View style={styles.checklist}>
            {guide.steps.map((step, index) => {
              const isChecked = progress.checkedSteps.includes(index);
              return (
                <Pressable
                  key={step.title}
                  style={({ pressed }) => [styles.stepRow, pressed && styles.checklistRowPressed]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  onPress={() => toggleStep(index)}>
                  <SymbolView
                    name={{
                      ios: isChecked ? 'checkmark.circle.fill' : 'circle',
                      android: isChecked ? 'check_circle' : 'radio_button_unchecked',
                      web: isChecked ? 'check_circle' : 'radio_button_unchecked',
                    }}
                    size={20}
                    tintColor={isChecked ? brand.teal : colors.secondaryPlaceholder}
                  />
                  <View style={styles.stepTextWrapper}>
                    <Text style={[styles.stepTitle, isChecked && styles.checklistLabelDone]}>
                      {index + 1}. {step.title}
                    </Text>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={({ pressed }) => [styles.doneButton, pressed && styles.doneButtonPressed]}
            accessibilityRole="button"
            onPress={handleFinishSteps}>
            <Text style={styles.doneButtonText}>Tapos na ang lahat ng hakbang</Text>
            <SymbolView
              name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
              size={16}
              tintColor={colors.primary}
            />
          </Pressable>
        </AccordionSection>

        <AccordionSection
          index={3}
          title="I-upload"
          subtitle={
            uploadedImages.length > 0
              ? `${uploadedImages.length} larawan na-upload`
              : 'I-upload ang larawan ng dokumento'
          }
          locked={!isStepsDone}
          completed={isUploadDone}
          expanded={expandedSection === 'upload'}
          onToggle={() => handleToggleSection('upload')}>
          <DocumentUploadPanel documentId={documentId} title={title} onImagesChange={setUploadedImages} />

          <Pressable
            style={({ pressed }) => [styles.doneButton, pressed && styles.doneButtonPressed]}
            accessibilityRole="button"
            onPress={handleFinishUpload}>
            <Text style={styles.doneButtonText}>Tapos</Text>
            <SymbolView
              name={{ ios: 'checkmark', android: 'check', web: 'check' }}
              size={16}
              tintColor={colors.primary}
            />
          </Pressable>
        </AccordionSection>
      </ScrollView>
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
  scrollArea: {
    flex: 1,
    marginTop: 16,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 14,
    paddingBottom: 32,
  },
  intro: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  checklist: {
    gap: 4,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  checklistRowPressed: {
    opacity: 0.7,
  },
  checklistTextWrapper: {
    flex: 1,
    gap: 2,
  },
  checklistLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: brand.navy,
    lineHeight: 20,
  },
  checklistLabelDone: {
    color: colors.secondary,
    textDecorationLine: 'line-through',
  },
  autoBadge: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: brand.teal,
  },
  dependencyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 30,
    paddingBottom: 8,
  },
  dependencyLinkPressed: {
    opacity: 0.7,
  },
  dependencyLinkText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: brand.teal,
    textDecorationLine: 'underline',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  stepTextWrapper: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: brand.navy,
    lineHeight: 20,
  },
  stepDescription: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.secondary,
    lineHeight: 18,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: brand.teal,
    marginTop: 4,
  },
  doneButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  doneButtonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  completeBanner: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(1, 154, 143, 0.35)',
    backgroundColor: 'rgba(1, 154, 143, 0.08)',
    ...cardShadow,
  },
  completeMascot: {
    width: 96,
    height: 96,
  },
  completeTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  completeMessage: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  completeButton: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: brand.navy,
  },
  completeButtonPressed: {
    opacity: 0.85,
  },
  completeButtonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
});
