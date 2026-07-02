import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, ref as databaseRef, set as databaseSet } from 'firebase/database';

import { auth, database } from '@/lib/firebase';
import type { ChatRole } from '@/services/chat';
import type { AideyReply, ChecklistItem } from '@/types/aidey-response';
import { hasValidInternetConnection } from '@/utils/internet-connection';

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
  /** The task checklist for this conversation. A conversation is "closed" once every item is done. */
  checklist: ChecklistItem[];
  createdAt: number;
  updatedAt: number;
};

export type ChatSessionSummary = Pick<
  ChatSession,
  'id' | 'title' | 'updatedAt' | 'checklist'
>;

type SessionMap = Record<string, ChatSession>;

let cache: SessionMap | null = null;
let pendingRead: Promise<SessionMap> | null = null;
const listeners = new Set<() => void>();

export function isChecklistComplete(checklist: ChecklistItem[] | undefined): boolean {
  return !!checklist?.length && checklist.every((item) => item.done);
}

export function isSessionOpen(session: Pick<ChatSession, 'checklist'>): boolean {
  return !isChecklistComplete(session.checklist);
}

/** Fills in defaults for fields that may be missing from older cached/remote records. */
function normalizeSession(id: string, value: Partial<Omit<ChatSession, 'id'>>): ChatSession {
  return {
    id,
    title: value.title ?? 'Bagong Chat',
    documentId: value.documentId ?? undefined,
    documentLabel: value.documentLabel ?? undefined,
    messages: Array.isArray(value.messages) ? value.messages : [],
    checklist: Array.isArray(value.checklist) ? value.checklist : [],
    createdAt: value.createdAt ?? Date.now(),
    updatedAt: value.updatedAt ?? Date.now(),
  };
}

function normalizeSessionMap(map: Record<string, Partial<Omit<ChatSession, 'id'>>>): SessionMap {
  const normalized: SessionMap = {};
  for (const [id, value] of Object.entries(map)) {
    normalized[id] = normalizeSession(id, value);
  }
  return normalized;
}

async function hydrateFromCloud(): Promise<SessionMap> {
  const uid = auth?.currentUser?.uid;
  if (!database || !uid) return {};

  const isOnline = await hasValidInternetConnection();
  if (!isOnline) return {};

  try {
    const snapshot = await get(databaseRef(database, `chatSessions/${uid}`));
    if (!snapshot.exists()) return {};

    const raw = snapshot.val() as Record<string, Partial<Omit<ChatSession, 'id'>>>;
    return normalizeSessionMap(raw);
  } catch (error) {
    console.warn('Failed to hydrate chat sessions from cloud', error);
    return {};
  }
}

async function readMap(): Promise<SessionMap> {
  if (cache) {
    return cache;
  }

  if (!pendingRead) {
    pendingRead = AsyncStorage.getItem(STORAGE_KEY).then(async (raw) => {
      const rawLocal = raw ? (JSON.parse(raw) as Record<string, Partial<Omit<ChatSession, 'id'>>>) : {};

      if (Object.keys(rawLocal).length > 0) {
        const local = normalizeSessionMap(rawLocal);
        cache = local;
        return local;
      }

      const remote = await hydrateFromCloud();
      cache = remote;

      if (Object.keys(remote).length > 0) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      }

      return remote;
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
    .map(({ id, title, updatedAt, checklist }) => ({ id, title, updatedAt, checklist }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getChatSession(id: string): Promise<ChatSession | null> {
  const map = await readMap();
  return map[id] ?? null;
}

/** The conversation that should be resumed on open — the most recently active one whose checklist isn't fully done yet. */
export async function getMostRecentOpenSession(): Promise<ChatSession | null> {
  const map = await readMap();
  const sessions = Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt);
  return sessions.find((session) => isSessionOpen(session)) ?? null;
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

async function syncSessionToCloud(session: ChatSession): Promise<void> {
  const uid = auth?.currentUser?.uid;
  if (!database || !uid) return;

  const isOnline = await hasValidInternetConnection();
  if (!isOnline) return;

  try {
    await databaseSet(databaseRef(database, `chatSessions/${uid}/${session.id}`), {
      title: session.title,
      documentId: session.documentId ?? null,
      documentLabel: session.documentLabel ?? null,
      messages: session.messages,
      checklist: session.checklist,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (error) {
    console.warn(`Failed to sync chat session ${session.id} to cloud`, error);
  }
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
    checklist: [],
    createdAt: now,
    updatedAt: now,
  };

  const map = await readMap();
  map[session.id] = session;
  await writeMap(map);

  void syncSessionToCloud(session);

  return session;
}

export async function saveChatSession(
  id: string,
  updates: { messages?: ChatMessageRecord[]; checklist?: ChecklistItem[] },
): Promise<ChatSession | null> {
  const map = await readMap();
  const existing = map[id];
  if (!existing) return null;

  const messages = updates.messages ?? existing.messages;

  const updated: ChatSession = {
    ...existing,
    messages,
    checklist: updates.checklist ?? existing.checklist,
    title: existing.title === 'Bagong Chat' ? deriveTitle(messages) : existing.title,
    updatedAt: Date.now(),
  };

  map[id] = updated;
  await writeMap(map);

  void syncSessionToCloud(updated);

  return updated;
}

export async function deleteChatSession(id: string): Promise<void> {
  const map = await readMap();
  if (!map[id]) return;

  delete map[id];
  await writeMap(map);
}
