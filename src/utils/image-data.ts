import { File } from 'expo-file-system';

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return globalThis.btoa(binary);
}

export async function readImageAsInlineData(
  uri: string,
  mimeType?: string,
): Promise<{ mimeType: string; data: string }> {
  const file = new File(uri);
  const data = arrayBufferToBase64(await file.arrayBuffer());

  return {
    mimeType: mimeType ?? MIME_TYPES_BY_EXTENSION[file.extension.toLowerCase()] ?? 'image/jpeg',
    data,
  };
}
