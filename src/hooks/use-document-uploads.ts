import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
  getDocumentUploadMap,
  retryPendingDocumentUploads,
  subscribeToDocumentUploads,
  type DocumentImageRecord,
} from '@/services/document-uploads';

export function useDocumentUploads() {
  const [uploads, setUploads] = useState<Record<string, DocumentImageRecord[]>>({});

  const refresh = useCallback(() => {
    void getDocumentUploadMap().then(setUploads);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToDocumentUploads(refresh);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      void retryPendingDocumentUploads();
    }, [refresh]),
  );

  return uploads;
}
