import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { get, ref as databaseRef, remove as databaseRemove, set as databaseSet } from 'firebase/database';
import { AppState } from 'react-native';

import { getCachedLocale } from '@/contexts/locale-context';
import { translate } from '@/i18n';
import { auth, database } from '@/lib/firebase';
import type { ChatRole } from '@/services/chat';
import type { AideyReply, ChecklistItem } from '@/types/aidey-response';
import { hasValidInternetConnection } from '@/utils/internet-connection';

const STORAGE_KEY_PREFIX = 'chat-sessions-v1';
const LEGACY_STORAGE_KEY = 'chat-sessions-v1';
const MAX_TITLE_LENGTH = 40;

function getStorageKey(uid: string): string {
  return `${STORAGE_KEY_PREFIX}:${uid}`;
}

export type ChatMessageRecord = {
  id: string;
  role: ChatRole;
  text: string;
  imageUri?: string;
  imageMimeType?: string;
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
  /** Archived conversations are hidden from the main list and never auto-resumed. */
  archived: boolean;
  createdAt: number;
  updatedAt: number;
};

export type ChatSessionSummary = Pick<
  ChatSession,
  'id' | 'title' | 'updatedAt' | 'checklist' | 'archived'
>;

type SessionMap = Record<string, ChatSession>;

let cache: SessionMap | null = null;
let pendingRead: Promise<SessionMap> | null = null;
let cachedUid: string | null | undefined;
const listeners = new Set<() => void>();

/** Clears in-memory session state. Call when the signed-in user changes. */
export function resetChatSessionsStore(): void {
  cache = null;
  pendingRead = null;
  cachedUid = undefined;
  listeners.forEach((listener) => listener());
}

function invalidateIfUserChanged(uid: string | null): void {
  if (cachedUid !== undefined && cachedUid !== uid) {
    cache = null;
    pendingRead = null;
  }
  cachedUid = uid;
}

export function isChecklistComplete(checklist: ChecklistItem[] | undefined): boolean {
  return !!checklist?.length && checklist.every((item) => item.done);
}

export function isSessionOpen(session: Pick<ChatSession, 'checklist'>): boolean {
  return !isChecklistComplete(session.checklist);
}

function getDefaultSessionTitle() {
  return translate(getCachedLocale(), 'ai.defaultSessionTitle');
}

function isDefaultSessionTitle(title: string) {
  return (
    title === translate('fil-PH', 'ai.defaultSessionTitle') ||
    title === translate('en-US', 'ai.defaultSessionTitle')
  );
}

/** Fills in defaults for fields that may be missing from older cached/remote records. */
function normalizeSession(id: string, value: Partial<Omit<ChatSession, 'id'>>): ChatSession {
  return {
    id,
    title: value.title ?? getDefaultSessionTitle(),
    documentId: value.documentId ?? undefined,
    documentLabel: value.documentLabel ?? undefined,
    messages: Array.isArray(value.messages) ? value.messages : [],
    checklist: Array.isArray(value.checklist) ? value.checklist : [],
    archived: value.archived ?? false,
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
  const uid = auth?.currentUser?.uid ?? null;
  invalidateIfUserChanged(uid);

  if (!uid) {
    return {};
  }

  if (cache) {
    return cache;
  }

  if (!pendingRead) {
    const storageKey = getStorageKey(uid);
    pendingRead = (async () => {
      let raw = await AsyncStorage.getItem(storageKey);

      // One-time migration from the pre-user-scoped storage key.
      if (!raw) {
        raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        if (raw) {
          await AsyncStorage.setItem(storageKey, raw);
          await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }

      const rawLocal = raw
        ? (JSON.parse(raw) as Record<string, Partial<Omit<ChatSession, 'id'>>>)
        : {};

      if (Object.keys(rawLocal).length > 0) {
        const local = normalizeSessionMap(rawLocal);
        cache = local;
        // Local already has data, so this device won't otherwise notice
        // sessions created/updated on another device — reconcile quietly.
        void syncChatSessionsWithCloud();
        return local;
      }

      const remote = await hydrateFromCloud();
      cache = remote;

      if (Object.keys(remote).length > 0) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(remote));
      }

      return remote;
    })();
  }

  return pendingRead;
}

async function writeMap(map: SessionMap) {
  const uid = auth?.currentUser?.uid;
  if (!uid) return;

  cachedUid = uid;
  cache = map;
  await AsyncStorage.setItem(getStorageKey(uid), JSON.stringify(map));
  listeners.forEach((listener) => listener());
}

let isSyncingChatSessions = false;

/** Reconciles local sessions with the cloud, keeping whichever version of
 * each session is newer (by `updatedAt`) and pushing any local session the
 * cloud is missing (e.g. saved while offline). This is what lets a
 * conversation started on one phone show up on another. */
export async function syncChatSessionsWithCloud(): Promise<void> {
  const uid = auth?.currentUser?.uid;
  if (!database || !uid || isSyncingChatSessions) return;

  isSyncingChatSessions = true;

  try {
    const isOnline = await hasValidInternetConnection();
    if (!isOnline) return;

    const [local, remote] = await Promise.all([readMap(), hydrateFromCloud()]);

    let changed = false;
    const merged: SessionMap = { ...local };

    for (const [id, remoteSession] of Object.entries(remote)) {
      const localSession = local[id];
      if (!localSession || remoteSession.updatedAt > localSession.updatedAt) {
        merged[id] = remoteSession;
        changed = true;
      }
    }

    for (const [id, localSession] of Object.entries(local)) {
      const remoteSession = remote[id];
      if (!remoteSession || localSession.updatedAt > remoteSession.updatedAt) {
        void syncSessionToCloud(localSession);
      }
    }

    if (changed) {
      await writeMap(merged);
    }
  } catch (error) {
    console.warn('Failed to sync chat sessions with cloud', error);
  } finally {
    isSyncingChatSessions = false;
  }
}

NetInfo.addEventListener((state) => {
  if (state.isConnected && state.isInternetReachable !== false) {
    void syncChatSessionsWithCloud();
  }
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    void syncChatSessionsWithCloud();
  }
});

export function subscribeToChatSessions(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function listChatSessions(): Promise<ChatSessionSummary[]> {
  const map = await readMap();
  return Object.values(map)
    .map(({ id, title, updatedAt, checklist, archived }) => ({
      id,
      title,
      updatedAt,
      checklist,
      archived,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getChatSession(id: string): Promise<ChatSession | null> {
  const map = await readMap();
  return map[id] ?? null;
}

/** The conversation that should be resumed on open — the most recently active,
 * non-archived one whose checklist isn't fully done yet. */
export async function getMostRecentOpenSession(): Promise<ChatSession | null> {
  const map = await readMap();
  const sessions = Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt);
  return sessions.find((session) => !session.archived && isSessionOpen(session)) ?? null;
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function deriveTitle(messages: ChatMessageRecord[]): string {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  if (!firstUserMessage) return getDefaultSessionTitle();

  const trimmed = firstUserMessage.text.trim();
  if (trimmed.length <= MAX_TITLE_LENGTH) return trimmed;
  return `${trimmed.slice(0, MAX_TITLE_LENGTH).trimEnd()}…`;
}

/** Firebase's `set()` rejects any `undefined` value anywhere in the object
 * tree (unlike JSON.stringify, which silently drops it). Optional fields on
 * chat messages and AI replies (structured, model, checklist, mapDestination,
 * etc.) are frequently undefined, so strip them recursively before writing. */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val === undefined) continue;
      result[key] = stripUndefined(val);
    }
    return result as T;
  }

  return value;
}

async function syncSessionToCloud(session: ChatSession): Promise<void> {
  const uid = auth?.currentUser?.uid;
  if (!database || !uid) return;

  const isOnline = await hasValidInternetConnection();
  if (!isOnline) return;

  try {
    await databaseSet(
      databaseRef(database, `chatSessions/${uid}/${session.id}`),
      stripUndefined({
        title: session.title,
        documentId: session.documentId ?? null,
        documentLabel: session.documentLabel ?? null,
        messages: session.messages,
        checklist: session.checklist,
        archived: session.archived,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }),
    );
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
    title: getDefaultSessionTitle(),
    documentId: options?.documentId,
    documentLabel: options?.documentLabel,
    messages: [],
    checklist: [],
    archived: false,
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
    title: isDefaultSessionTitle(existing.title) ? deriveTitle(messages) : existing.title,
    updatedAt: Date.now(),
  };

  map[id] = updated;
  await writeMap(map);

  void syncSessionToCloud(updated);

  return updated;
}

export async function setChatSessionArchived(
  id: string,
  archived: boolean,
): Promise<ChatSession | null> {
  const map = await readMap();
  const existing = map[id];
  if (!existing) return null;

  const updated: ChatSession = { ...existing, archived };
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

  const uid = auth?.currentUser?.uid;
  if (!database || !uid) return;

  try {
    // Without this, a session deleted here would reappear the next time
    // this device merges with the cloud (or on another device entirely).
    await databaseRemove(databaseRef(database, `chatSessions/${uid}/${id}`));
  } catch (error) {
    console.warn(`Failed to delete chat session ${id} from cloud`, error);
  }
}
