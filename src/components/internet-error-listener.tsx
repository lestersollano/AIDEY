import { usePathname } from 'expo-router';
import { useEffect, useState } from 'react';

import { InternetErrorModal } from '@/components/internet-error-modal';
import { useTranslation } from '@/contexts/locale-context';
import { consumePendingError, type PendingError } from '@/utils/internet-connection';

export function InternetErrorListener() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [errorType, setErrorType] = useState<PendingError['type']>('connection');

  useEffect(() => {
    const pending = consumePendingError();
    if (pending) {
      setErrorType(pending.type);
      setVisible(true);
    }
  }, [pathname]);

  const title =
    errorType === 'ai-unavailable' ? t('connection.aiUnavailableTitle') : t('connection.title');
  const message =
    errorType === 'ai-unavailable'
      ? t('connection.aiUnavailableMessage')
      : t('connection.message');

  return (
    <InternetErrorModal
      visible={visible}
      title={title}
      message={message}
      onDismiss={() => setVisible(false)}
    />
  );
}
