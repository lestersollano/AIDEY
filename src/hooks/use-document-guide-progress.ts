import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
  getAllDocumentGuideProgress,
  getDocumentGuideProgress,
  markSectionComplete,
  retryDocumentGuideProgressSync,
  subscribeToDocumentGuideProgress,
  toggleRequirementChecked,
  toggleStepChecked,
  type DocumentGuideProgress,
  type DocumentGuideSection,
} from '@/services/document-guide-progress';

export function useDocumentGuideProgress(documentId: string) {
  const [progress, setProgress] = useState<DocumentGuideProgress>({
    checkedRequirements: [],
    checkedSteps: [],
    completedSections: [],
    updatedAt: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    void getDocumentGuideProgress(documentId).then((next) => {
      setProgress(next);
      setIsLoaded(true);
    });
  }, [documentId]);

  useEffect(() => {
    refresh();
    return subscribeToDocumentGuideProgress(refresh);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      void retryDocumentGuideProgressSync();
    }, []),
  );

  const toggleRequirement = useCallback(
    (index: number) => {
      void toggleRequirementChecked(documentId, index);
    },
    [documentId],
  );

  const toggleStep = useCallback(
    (index: number) => {
      void toggleStepChecked(documentId, index);
    },
    [documentId],
  );

  const completeSection = useCallback(
    (section: DocumentGuideSection) => {
      void markSectionComplete(documentId, section);
    },
    [documentId],
  );

  return { progress, isLoaded, toggleRequirement, toggleStep, completeSection };
}

/** Progress for every document the user has made any headway on, keyed by
 * documentId — used to inform the AI assistant of self-service progress. */
export function useAllDocumentGuideProgress() {
  const [progressByDocument, setProgressByDocument] = useState<Record<string, DocumentGuideProgress>>({});

  const refresh = useCallback(() => {
    void getAllDocumentGuideProgress().then(setProgressByDocument);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToDocumentGuideProgress(refresh);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      void retryDocumentGuideProgressSync();
    }, [refresh]),
  );

  return progressByDocument;
}
