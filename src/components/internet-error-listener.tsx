import { usePathname } from 'expo-router';
import { useEffect, useState } from 'react';

import { InternetErrorModal } from '@/components/internet-error-modal';
import { consumePendingError, type PendingError } from '@/utils/internet-connection';

const ERROR_COPY: Record<
  PendingError['type'],
  { title: string; message: string }
> = {
  connection: {
    title: 'Problema sa Koneksyon',
    message:
      'Siguraduhing nakakonekta ka sa internet. Kung nakakonekta ka na, maaaring hindi stable ang iyong koneksyon.',
  },
  'ai-unavailable': {
    title: 'AIDEY Hindi Available',
    message:
      "AIDEY isn't available for now. Something went wrong, please try again later.",
  },
};

export function InternetErrorListener() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [copy, setCopy] = useState(ERROR_COPY.connection);

  useEffect(() => {
    const pending = consumePendingError();
    if (pending) {
      setCopy(ERROR_COPY[pending.type]);
      setVisible(true);
    }
  }, [pathname]);

  return (
    <InternetErrorModal
      visible={visible}
      title={copy.title}
      message={copy.message}
      onDismiss={() => setVisible(false)}
    />
  );
}
