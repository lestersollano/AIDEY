import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref as databaseRef, set as databaseSet } from 'firebase/database';

import { auth, database } from '@/lib/firebase';
import { hasValidInternetConnection } from '@/utils/internet-connection';
import type { ChecklistItem } from '@/types/aidey-response';

const STORAGE_KEY = 'task-checklists-v1';

export type StoredChecklist = {
  taskKey: string;
  documentLabel?: string;
  items: ChecklistItem[];
  updatedAt: number;
};

type ChecklistMap = Record<string, StoredChecklist>;

let cache: ChecklistMap | null = null;
let pendingRead: Promise<ChecklistMap> | null = null;
const listeners = new Set<() => void>();

async function readMap(): Promise<ChecklistMap> {
  if (cache) {
    return cache;
  }

  if (!pendingRead) {
    pendingRead = AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      cache = raw ? (JSON.parse(raw) as ChecklistMap) : {};
      return cache;
    });
  }

  return pendingRead;
}

async function writeMap(map: ChecklistMap) {
  cache = map;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  listeners.forEach((listener) => listener());
}

export function subscribeToTaskChecklists(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getTaskChecklist(taskKey: string): Promise<StoredChecklist | null> {
  const map = await readMap();
  return map[taskKey] ?? null;
}

async function syncChecklistToFirebase(record: StoredChecklist): Promise<void> {
  const uid = auth?.currentUser?.uid;
  if (!database || !uid) return;

  const isOnline = await hasValidInternetConnection();
  if (!isOnline) return;

  try {
    await databaseSet(databaseRef(database, `taskChecklists/${uid}/${record.taskKey}`), {
      documentLabel: record.documentLabel ?? null,
      items: record.items,
      updatedAt: record.updatedAt,
    });
  } catch (error) {
    console.warn(`Failed to sync task checklist for ${record.taskKey}`, error);
  }
}

export async function saveTaskChecklist(
  taskKey: string,
  items: ChecklistItem[],
  documentLabel?: string,
): Promise<StoredChecklist> {
  const record: StoredChecklist = {
    taskKey,
    documentLabel,
    items,
    updatedAt: Date.now(),
  };

  const map = await readMap();
  map[taskKey] = record;
  await writeMap(map);

  void syncChecklistToFirebase(record);

  return record;
}

export async function setTaskChecklistItemDone(
  taskKey: string,
  itemId: string,
  done: boolean,
): Promise<StoredChecklist | null> {
  const map = await readMap();
  const existing = map[taskKey];
  if (!existing) return null;

  const updated: StoredChecklist = {
    ...existing,
    items: existing.items.map((item) => (item.id === itemId ? { ...item, done } : item)),
    updatedAt: Date.now(),
  };

  map[taskKey] = updated;
  await writeMap(map);

  void syncChecklistToFirebase(updated);

  return updated;
}

export async function clearTaskChecklist(taskKey: string): Promise<void> {
  const map = await readMap();
  if (!map[taskKey]) return;

  delete map[taskKey];
  await writeMap(map);
}
