import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ChatRole } from '@/services/chat';
import type { AideyReply } from '@/types/aidey-response';

const STORAGE_KEY = 'chat-sessions-v1';
const MAX_TITLE_LENGTH = 40;

export type ChatMessageRecord = {
  id: string;
  role: ChatRole;
  text: string;
  structured?: AideyReply;
  model?: string;
  isArrivalCheck?: boolean;
};

export type ChatSession = {
  id: string;
  title: string;
  documentId?: string;
  documentLabel?: string;
  messages: ChatMessageRecord[];
  createdAt: number;
  updatedAt: number;
};

export type ChatSessionSummary = Pick<ChatSession, 'id' | 'title' | 'updatedAt'>;

type SessionMap = Record<string, ChatSession>;

let cache: SessionMap | null = null;
let pendingRead: Promise<SessionMap> | null = null;
const listeners = new Set<() => void>();

async function readMap(): Promise<SessionMap> {
  if (cache) {
    return cache;
  }

  if (!pendingRead) {
    pendingRead = AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      cache = raw ? (JSON.parse(raw) as SessionMap) : {};
      return cache;
    });
  }

  return pendingRead;
}

async function writeMap(map: SessionMap) {
  cache = map;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  listeners.forEach((listener) => listener());
}

export function subscribeToChatSessions(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function listChatSessions(): Promise<ChatSessionSummary[]> {
  const map = await readMap();
  return Object.values(map)
    .map(({ id, title, updatedAt }) => ({ id, title, updatedAt }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getChatSession(id: string): Promise<ChatSession | null> {
  const map = await readMap();
  return map[id] ?? null;
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function deriveTitle(messages: ChatMessageRecord[]): string {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  if (!firstUserMessage) return 'Bagong Chat';

  const trimmed = firstUserMessage.text.trim();
  if (trimmed.length <= MAX_TITLE_LENGTH) return trimmed;
  return `${trimmed.slice(0, MAX_TITLE_LENGTH).trimEnd()}…`;
}

export async function createChatSession(options?: {
  documentId?: string;
  documentLabel?: string;
}): Promise<ChatSession> {
  const now = Date.now();
  const session: ChatSession = {
    id: generateSessionId(),
    title: 'Bagong Chat',
    documentId: options?.documentId,
    documentLabel: options?.documentLabel,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  const map = await readMap();
  map[session.id] = session;
  await writeMap(map);

  return session;
}

export async function saveChatSessionMessages(
  id: string,
  messages: ChatMessageRecord[],
): Promise<void> {
  const map = await readMap();
  const existing = map[id];
  if (!existing) return;

  const updated: ChatSession = {
    ...existing,
    messages,
    title: existing.title === 'Bagong Chat' ? deriveTitle(messages) : existing.title,
    updatedAt: Date.now(),
  };

  map[id] = updated;
  await writeMap(map);
}

export async function deleteChatSession(id: string): Promise<void> {
  const map = await readMap();
  if (!map[id]) return;

  delete map[id];
  await writeMap(map);
}
