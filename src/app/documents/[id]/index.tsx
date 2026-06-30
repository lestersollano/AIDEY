import { Redirect, useLocalSearchParams } from 'expo-router';

import { DocumentDetailScreen } from '@/components/document-detail-screen';
import { getDocumentById } from '@/constants/documents';

export default function DocumentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const document = getDocumentById(id ?? '');

  if (!document) {
    return <Redirect href="/documents" />;
  }

  return <DocumentDetailScreen documentId={document.id} title={document.label} />;
}
