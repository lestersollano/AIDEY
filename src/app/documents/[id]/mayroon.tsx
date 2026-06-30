import { Redirect, useLocalSearchParams } from 'expo-router';

import { DocumentMayroonScreen } from '@/components/document-mayroon-screen';
import { getDocumentById } from '@/constants/documents';

export default function DocumentMayroonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const document = getDocumentById(id ?? '');

  if (!document) {
    return <Redirect href="/documents" />;
  }

  return <DocumentMayroonScreen title={document.label} />;
}
