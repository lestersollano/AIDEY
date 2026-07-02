import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import {
  listChatSessions,
  subscribeToChatSessions,
  type ChatSessionSummary,
} from '@/services/chat-sessions';

export function useChatSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);

  const refresh = useCallback(() => {
    void listChatSessions().then(setSessions);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToChatSessions(refresh);
  }, [refresh, user?.uid]);

  return sessions;
}
