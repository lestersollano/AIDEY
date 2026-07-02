import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Directory, File, Paths } from 'expo-file-system';
import { get, ref as databaseRef, remove as databaseRemove, set as databaseSet } from 'firebase/database';
import { AppState } from 'react-native';
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
  type UploadMetadata,
} from 'firebase/storage';

import { auth, database, storage } from '@/lib/firebase';
import { hasValidInternetConnection } from '@/utils/internet-connection';

const STORAGE_KEY_PREFIX = 'document-uploads-v2';
const LEGACY_STORAGE_KEY = 'document-uploads-v2';

function getStorageKey(uid: string): string {
  return `${STORAGE_KEY_PREFIX}:${uid}`;
}

export type DocumentUploadStatus = 'uploaded' | 'pending' | 'uploading';

export type DocumentImageRecord = {
  id: string;
  documentId: string;
  localUri: string;
  remoteUrl?: string;
  storagePath?: string;
  status: DocumentUploadStatus;
  updatedAt: number;
};

type UploadMap = Record<string, DocumentImageRecord[]>;

let cache: UploadMap | null = null;
let pendingRead: Promise<UploadMap> | null = null;
let cachedUid: string | null | undefined;
const listeners = new Set<() => void>();

/** Clears in-memory upload state. Call when the signed-in user changes. */
export function resetDocumentUploadsStore(): void {
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

type CloudImageRecord = { remoteUrl?: string; storagePath?: string; updatedAt?: number };

/** Reads whatever image metadata the cloud knows about for this user. Used to
 * backfill the local gallery after a reinstall or on a new device, where
 * AsyncStorage is empty but the uploads still exist in Firebase. */
async function hydrateFromCloud(): Promise<UploadMap> {
  const uid = auth?.currentUser?.uid;
  if (!database || !uid) return {};

  const isOnline = await hasValidInternetConnection();
  if (!isOnline) return {};

  try {
    const snapshot = await get(databaseRef(database, `documentUploads/${uid}`));
    if (!snapshot.exists()) return {};

    const raw = snapshot.val() as Record<string, Record<string, CloudImageRecord>>;
    const map: UploadMap = {};

    for (const [documentId, images] of Object.entries(raw)) {
      const records: DocumentImageRecord[] = [];

      for (const [imageId, value] of Object.entries(images ?? {})) {
        if (!value?.remoteUrl) continue;

        records.push({
          id: imageId,
          documentId,
          // Displays straight from the cloud until the quiet background
          // download below finishes writing a local copy of the file.
          localUri: value.remoteUrl,
          remoteUrl: value.remoteUrl,
          storagePath: value.storagePath,
          status: 'uploaded',
          updatedAt: value.updatedAt ?? Date.now(),
        });
      }

      if (records.length > 0) {
        map[documentId] = records;
      }
    }

    return map;
  } catch (error) {
    console.warn('Failed to hydrate document uploads from cloud', error);
    return {};
  }
}

function getExtensionFromStoragePath(storagePath: string | undefined): string {
  const match = storagePath?.match(/(\.[a-zA-Z0-9]+)$/);
  return match ? match[1] : '.jpg';
}

/** Quietly backfills local copies of images that exist in the cloud but not
 * yet on this device (e.g. right after `hydrateFromCloud`), so the gallery
 * keeps working offline once each download finishes. Records display fine
 * in the meantime since their `localUri` already points at the remote URL. */
async function downloadMissingLocalFiles(map: UploadMap): Promise<void> {
  const directory = getDocumentsDirectory();

  for (const [documentId, images] of Object.entries(map)) {
    for (const image of images) {
      if (!image.remoteUrl || image.localUri !== image.remoteUrl) continue;

      try {
        const extension = getExtensionFromStoragePath(image.storagePath);
        const destination = new File(directory, `${documentId}-${image.id}${extension}`);
        const downloaded = await File.downloadFileAsync(image.remoteUrl, destination, {
          idempotent: true,
        });

        const latestMap = await readMap();
        const currentImages = latestMap[documentId];
        if (!currentImages?.some((item) => item.id === image.id)) continue;

        latestMap[documentId] = currentImages.map((item) =>
          item.id === image.id ? { ...item, localUri: downloaded.uri } : item,
        );
        await writeMap(latestMap);
      } catch (error) {
        console.warn(`Failed to download document image ${documentId}/${image.id}`, error);
      }
    }
  }
}

let isSyncingUploads = false;

/** Reconciles local uploads with the cloud: adopts images added on another
 * device (and quietly downloads them), and removes previously-synced images
 * that were deleted elsewhere. Images still `pending`/`uploading` locally are
 * left alone since the cloud doesn't know about them yet. */
export async function syncDocumentUploadsWithCloud(): Promise<void> {
  const uid = auth?.currentUser?.uid;
  if (!database || !uid || isSyncingUploads) return;

  isSyncingUploads = true;

  try {
    const isOnline = await hasValidInternetConnection();
    if (!isOnline) return;

    const [local, remote] = await Promise.all([readMap(), hydrateFromCloud()]);

    let changed = false;
    const merged: UploadMap = {};
    const removedImages: DocumentImageRecord[] = [];
    const documentIds = new Set([...Object.keys(local), ...Object.keys(remote)]);

    for (const documentId of documentIds) {
      const localImages = local[documentId] ?? [];
      const remoteImages = remote[documentId] ?? [];
      const remoteById = new Map(remoteImages.map((image) => [image.id, image]));
      const localIds = new Set(localImages.map((image) => image.id));

      const kept = localImages.filter((image) => {
        // Prune images this device previously synced but that no longer
        // exist in the cloud (deleted from another device). Anything not
        // yet uploaded here is left alone — the cloud simply doesn't know
        // about it yet.
        if (image.status === 'uploaded' && !remoteById.has(image.id)) {
          changed = true;
          removedImages.push(image);
          return false;
        }
        return true;
      });

      const added = remoteImages.filter((image) => !localIds.has(image.id));
      if (added.length > 0) {
        changed = true;
      }

      const images = [...kept, ...added];
      if (images.length > 0) {
        merged[documentId] = images;
      }
    }

    if (!changed) return;

    await writeMap(merged);
    void downloadMissingLocalFiles(merged);

    for (const image of removedImages) {
      try {
        const localFile = new File(image.localUri);
        if (localFile.exists) {
          localFile.delete();
        }
      } catch (error) {
        console.warn(`Failed to delete local file for removed image ${image.id}`, error);
      }
    }
  } catch (error) {
    console.warn('Failed to sync document uploads with cloud', error);
  } finally {
    isSyncingUploads = false;
  }
}

async function readMap(): Promise<UploadMap> {
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

      const rawLocal = raw ? (JSON.parse(raw) as UploadMap) : {};

      if (Object.keys(rawLocal).length > 0) {
        cache = rawLocal;
        // Local already has data, so this device won't otherwise notice
        // uploads added/removed on another device — reconcile quietly.
        void syncDocumentUploadsWithCloud();
        return rawLocal;
      }

      const remote = await hydrateFromCloud();
      cache = remote;

      if (Object.keys(remote).length > 0) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(remote));
        void downloadMissingLocalFiles(remote);
      }

      return remote;
    })();
  }

  return pendingRead;
}

async function writeMap(map: UploadMap) {
  const uid = auth?.currentUser?.uid;
  if (!uid) return;

  cachedUid = uid;
  cache = map;
  await AsyncStorage.setItem(getStorageKey(uid), JSON.stringify(map));
  listeners.forEach((listener) => listener());
}

export function subscribeToDocumentUploads(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getDocumentUploadMap(): Promise<UploadMap> {
  return { ...(await readMap()) };
}

export async function getDocumentImages(documentId: string): Promise<DocumentImageRecord[]> {
  const map = await readMap();
  return map[documentId] ?? [];
}

function getDocumentsDirectory(): Directory {
  const directory = new Directory(Paths.document, 'documents');

  if (!directory.exists) {
    directory.create({ intermediates: true });
  }

  return directory;
}

function getFileExtension(uri: string): string {
  const extension = Paths.extname(uri);
  return extension || '.jpg';
}

function generateImageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

function getMimeType(extension: string): string {
  return MIME_TYPES_BY_EXTENSION[extension.toLowerCase()] ?? 'image/jpeg';
}

// React Native's Blob implementation cannot build a Blob from an ArrayBuffer /
// Uint8Array, which is what `fetch(uri).blob()` and passing raw bytes to
// `uploadBytes` end up doing. Using XMLHttpRequest with `responseType: 'blob'`
// returns a native, file-backed Blob that Firebase Storage can upload directly.
function fetchLocalFileAsBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error(`Failed to read local file: ${uri}`));
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

async function saveImageLocally(
  documentId: string,
  imageId: string,
  sourceUri: string,
): Promise<string> {
  const directory = getDocumentsDirectory();
  const destination = new File(directory, `${documentId}-${imageId}${getFileExtension(sourceUri)}`);

  if (destination.exists) {
    destination.delete();
  }

  const source = new File(sourceUri);
  await source.copy(destination);

  return destination.uri;
}

async function uploadRecordToFirebase(
  record: DocumentImageRecord,
): Promise<DocumentImageRecord> {
  const uid = auth?.currentUser?.uid;

  if (!storage || !database || !uid) {
    return { ...record, status: 'pending' };
  }

  const isOnline = await hasValidInternetConnection();

  if (!isOnline) {
    return { ...record, status: 'pending' };
  }

  let blob: Blob | null = null;

  try {
    const extension = getFileExtension(record.localUri);
    blob = await fetchLocalFileAsBlob(record.localUri);

    const path = `documents/${uid}/${record.documentId}/${record.id}${extension}`;
    const fileRef = storageRef(storage, path);
    const metadata: UploadMetadata = { contentType: getMimeType(extension) };
    await uploadBytes(fileRef, blob, metadata);
    const remoteUrl = await getDownloadURL(fileRef);

    await databaseSet(
      databaseRef(database, `documentUploads/${uid}/${record.documentId}/${record.id}`),
      {
        remoteUrl,
        storagePath: path,
        updatedAt: Date.now(),
      },
    );

    return { ...record, remoteUrl, storagePath: path, status: 'uploaded', updatedAt: Date.now() };
  } catch (error) {
    console.warn(`Failed to upload document image for ${record.documentId}`, error);
    return { ...record, status: 'pending' };
  } finally {
    (blob as (Blob & { close?: () => void }) | null)?.close?.();
  }
}

export async function addDocumentImage(
  documentId: string,
  sourceUri: string,
): Promise<DocumentImageRecord> {
  const imageId = generateImageId();
  const localUri = await saveImageLocally(documentId, imageId, sourceUri);

  const uploadingRecord: DocumentImageRecord = {
    id: imageId,
    documentId,
    localUri,
    status: 'uploading',
    updatedAt: Date.now(),
  };

  const map = await readMap();
  map[documentId] = [...(map[documentId] ?? []), uploadingRecord];
  await writeMap(map);

  const finalRecord = await uploadRecordToFirebase(uploadingRecord);

  const latestMap = await readMap();
  latestMap[documentId] = (latestMap[documentId] ?? []).map((image) =>
    image.id === imageId ? finalRecord : image,
  );
  await writeMap(latestMap);

  return finalRecord;
}

export async function removeDocumentImage(documentId: string, imageId: string): Promise<void> {
  const map = await readMap();
  const image = map[documentId]?.find((item) => item.id === imageId);

  if (!image) {
    return;
  }

  try {
    const localFile = new File(image.localUri);
    if (localFile.exists) {
      localFile.delete();
    }
  } catch (error) {
    console.warn(`Failed to delete local file for ${documentId}/${imageId}`, error);
  }

  const uid = auth?.currentUser?.uid;

  if (storage && database && uid && image.storagePath && (await hasValidInternetConnection())) {
    try {
      await deleteObject(storageRef(storage, image.storagePath));
    } catch (error) {
      console.warn(`Failed to delete remote file for ${documentId}/${imageId}`, error);
    }

    try {
      await databaseRemove(databaseRef(database, `documentUploads/${uid}/${documentId}/${imageId}`));
    } catch (error) {
      console.warn(`Failed to delete database entry for ${documentId}/${imageId}`, error);
    }
  }

  const latestMap = await readMap();
  const remainingImages = (latestMap[documentId] ?? []).filter((item) => item.id !== imageId);

  if (remainingImages.length > 0) {
    latestMap[documentId] = remainingImages;
  } else {
    delete latestMap[documentId];
  }

  await writeMap(latestMap);
}

let isRetrying = false;

export async function retryPendingDocumentUploads(): Promise<void> {
  if (isRetrying) {
    return;
  }

  isRetrying = true;

  try {
    const map = await readMap();
    const pendingRecords = Object.values(map)
      .flat()
      .filter((record) => record.status !== 'uploaded');

    for (const record of pendingRecords) {
      const updated = await uploadRecordToFirebase(record);
      const latestMap = await readMap();
      latestMap[record.documentId] = (latestMap[record.documentId] ?? []).map((image) =>
        image.id === record.id ? updated : image,
      );
      await writeMap(latestMap);
    }
  } finally {
    isRetrying = false;
  }
}

NetInfo.addEventListener((state) => {
  if (state.isConnected && state.isInternetReachable !== false) {
    void retryPendingDocumentUploads();
    void syncDocumentUploadsWithCloud();
  }
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    void syncDocumentUploadsWithCloud();
  }
});
