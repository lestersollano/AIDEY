import { Redirect, useLocalSearchParams } from 'expo-router';

import { DocumentWalaScreen } from '@/components/document-wala-screen';
import { getDocumentById } from '@/constants/documents';

export default function DocumentWalaRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const document = getDocumentById(id ?? '');

  if (!document) {
    return <Redirect href="/documents" />;
  }

  return <DocumentWalaScreen documentId={document.id} title={document.label} />;
}
