import { useCallback, useEffect, useState } from 'react';

import {
  listChatSessions,
  subscribeToChatSessions,
  type ChatSessionSummary,
} from '@/services/chat-sessions';

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);

  const refresh = useCallback(() => {
    void listChatSessions().then(setSessions);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToChatSessions(refresh);
  }, [refresh]);

  return sessions;
}
