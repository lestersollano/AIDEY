import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { get, ref as databaseRef, set as databaseSet } from 'firebase/database';

import { auth, database } from '@/lib/firebase';
import { hasValidInternetConnection } from '@/utils/internet-connection';

const STORAGE_KEY = 'document-guide-progress-v1';

export type DocumentGuideSection = 'requirements' | 'steps' | 'upload';

export type DocumentGuideProgress = {
  checkedRequirements: number[];
  checkedSteps: number[];
  completedSections: DocumentGuideSection[];
  updatedAt: number;
};

type ProgressMap = Record<string, DocumentGuideProgress>;

const EMPTY_PROGRESS: DocumentGuideProgress = {
  checkedRequirements: [],
  checkedSteps: [],
  completedSections: [],
  updatedAt: 0,
};

const VALID_SECTIONS: DocumentGuideSection[] = ['requirements', 'steps', 'upload'];

let cache: ProgressMap | null = null;
let pendingRead: Promise<ProgressMap> | null = null;
const listeners = new Set<() => void>();

function normalizeProgress(value: Partial<DocumentGuideProgress> | null | undefined): DocumentGuideProgress {
  return {
    checkedRequirements: Array.isArray(value?.checkedRequirements)
      ? value.checkedRequirements.filter((item): item is number => typeof item === 'number')
      : [],
    checkedSteps: Array.isArray(value?.checkedSteps)
      ? value.checkedSteps.filter((item): item is number => typeof item === 'number')
      : [],
    completedSections: Array.isArray(value?.completedSections)
      ? value.completedSections.filter((item): item is DocumentGuideSection =>
          VALID_SECTIONS.includes(item as DocumentGuideSection),
        )
      : [],
    updatedAt: typeof value?.updatedAt === 'number' ? value.updatedAt : 0,
  };
}

function normalizeProgressMap(map: Record<string, Partial<DocumentGuideProgress>>): ProgressMap {
  const normalized: ProgressMap = {};
  for (const [id, value] of Object.entries(map)) {
    normalized[id] = normalizeProgress(value);
  }
  return normalized;
}

async function hydrateFromCloud(): Promise<ProgressMap> {
  const uid = auth?.currentUser?.uid;
  if (!database || !uid) return {};

  const isOnline = await hasValidInternetConnection();
  if (!isOnline) return {};

  try {
    const snapshot = await get(databaseRef(database, `documentGuideProgress/${uid}`));
    if (!snapshot.exists()) return {};

    const raw = snapshot.val() as Record<string, Partial<DocumentGuideProgress>>;
    return normalizeProgressMap(raw);
  } catch (error) {
    console.warn('Failed to hydrate document guide progress from cloud', error);
    return {};
  }
}

async function readMap(): Promise<ProgressMap> {
  if (cache) {
    return cache;
  }

  if (!pendingRead) {
    pendingRead = AsyncStorage.getItem(STORAGE_KEY).then(async (raw) => {
      const rawLocal = raw ? (JSON.parse(raw) as Record<string, Partial<DocumentGuideProgress>>) : {};

      if (Object.keys(rawLocal).length > 0) {
        const local = normalizeProgressMap(rawLocal);
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

async function writeMap(map: ProgressMap) {
  cache = map;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  listeners.forEach((listener) => listener());
}

async function syncProgressToCloud(documentId: string, progress: DocumentGuideProgress): Promise<void> {
  const uid = auth?.currentUser?.uid;
  if (!database || !uid) return;

  const isOnline = await hasValidInternetConnection();
  if (!isOnline) return;

  try {
    await databaseSet(databaseRef(database, `documentGuideProgress/${uid}/${documentId}`), progress);
  } catch (error) {
    console.warn(`Failed to sync document guide progress for ${documentId} to cloud`, error);
  }
}

export function subscribeToDocumentGuideProgress(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getDocumentGuideProgress(documentId: string): Promise<DocumentGuideProgress> {
  const map = await readMap();
  return map[documentId] ?? EMPTY_PROGRESS;
}

/** Returns guide progress for every document that has any saved progress,
 * keyed by documentId — used to make the AI assistant aware of what the
 * user has already accomplished on their own via the step-by-step guides. */
export async function getAllDocumentGuideProgress(): Promise<ProgressMap> {
  return { ...(await readMap()) };
}

async function updateProgress(
  documentId: string,
  updater: (current: DocumentGuideProgress) => DocumentGuideProgress,
): Promise<DocumentGuideProgress> {
  const map = await readMap();
  const current = map[documentId] ?? EMPTY_PROGRESS;
  const next = { ...updater(current), updatedAt: Date.now() };
  await writeMap({ ...map, [documentId]: next });

  void syncProgressToCloud(documentId, next);

  return next;
}

export function toggleRequirementChecked(documentId: string, index: number) {
  return updateProgress(documentId, (current) => {
    const isChecked = current.checkedRequirements.includes(index);
    return {
      ...current,
      checkedRequirements: isChecked
        ? current.checkedRequirements.filter((item) => item !== index)
        : [...current.checkedRequirements, index],
    };
  });
}

export function toggleStepChecked(documentId: string, index: number) {
  return updateProgress(documentId, (current) => {
    const isChecked = current.checkedSteps.includes(index);
    return {
      ...current,
      checkedSteps: isChecked
        ? current.checkedSteps.filter((item) => item !== index)
        : [...current.checkedSteps, index],
    };
  });
}

export function markSectionComplete(documentId: string, section: DocumentGuideSection) {
  return updateProgress(documentId, (current) => {
    if (current.completedSections.includes(section)) {
      return current;
    }

    return { ...current, completedSections: [...current.completedSections, section] };
  });
}

export function resetDocumentGuideProgress(documentId: string) {
  return updateProgress(documentId, () => EMPTY_PROGRESS);
}

let isRetryingSync = false;

/** Pushes any locally-cached progress up to the cloud once a connection (or
 * sign-in) becomes available, so nothing gets lost while offline/signed-out. */
export async function retryDocumentGuideProgressSync(): Promise<void> {
  const uid = auth?.currentUser?.uid;
  if (!database || !uid || isRetryingSync) return;

  isRetryingSync = true;

  try {
    const isOnline = await hasValidInternetConnection();
    if (!isOnline) return;

    const map = await readMap();
    for (const [documentId, progress] of Object.entries(map)) {
      await syncProgressToCloud(documentId, progress);
    }
  } finally {
    isRetryingSync = false;
  }
}

NetInfo.addEventListener((state) => {
  if (state.isConnected && state.isInternetReachable !== false) {
    void retryDocumentGuideProgressSync();
  }
});
