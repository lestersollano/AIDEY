import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
  getDocumentUploadMap,
  getDocumentUploadsSyncState,
  retryPendingDocumentUploads,
  subscribeToDocumentUploads,
  subscribeToDocumentUploadsSyncState,
  type DocumentImageRecord,
  type DocumentUploadsSyncState,
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

/** Tracks whether document uploads are currently being loaded for the first
 * time (nothing to show yet) or reconciled/downloaded in the background
 * (data is already showing). Useful for rendering loading/syncing UI. */
export function useDocumentUploadsSyncStatus(): DocumentUploadsSyncState {
  const [status, setStatus] = useState<DocumentUploadsSyncState>(getDocumentUploadsSyncState);

  useEffect(
    () => subscribeToDocumentUploadsSyncState(() => setStatus(getDocumentUploadsSyncState())),
    [],
  );

  return status;
}
