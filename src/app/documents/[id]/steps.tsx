import { Redirect, useLocalSearchParams } from 'expo-router';

import { DocumentStepsScreen } from '@/components/document-steps-screen';
import { getDocumentById } from '@/constants/documents';

export default function DocumentStepsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const document = getDocumentById(id ?? '');

  if (!document) {
    return <Redirect href="/documents" />;
  }

  return <DocumentStepsScreen documentId={document.id} title={document.label} />;
}
