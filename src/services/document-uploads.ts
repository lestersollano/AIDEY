import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Directory, File, Paths } from 'expo-file-system';
import { ref as databaseRef, remove as databaseRemove, set as databaseSet } from 'firebase/database';
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
  type UploadMetadata,
} from 'firebase/storage';

import { auth, database, storage } from '@/lib/firebase';
import { hasValidInternetConnection } from '@/utils/internet-connection';

const STORAGE_KEY = 'document-uploads-v2';

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
const listeners = new Set<() => void>();

async function readMap(): Promise<UploadMap> {
  if (cache) {
    return cache;
  }

  if (!pendingRead) {
    pendingRead = AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      cache = raw ? (JSON.parse(raw) as UploadMap) : {};
      return cache;
    });
  }

  return pendingRead;
}

async function writeMap(map: UploadMap) {
  cache = map;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
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
  }
});
