'use client';

/**
 * Photo storage.
 *
 * Photos are the whole point of a moment, and they are far too big for
 * localStorage (5MB for everything, and one phone snap is 3–5MB on its own).
 * Blobs live in IndexedDB keyed by id; the moment record in localStorage only
 * carries that id. Every photo is downscaled and re-encoded before it is
 * stored, so a night out costs a few hundred kilobytes rather than tens of
 * megabytes.
 */

const DB_NAME = 'convivia24';
const DB_VERSION = 1;
const STORE = 'photos';

/** Long edge, in CSS pixels. Generous for a full-bleed phone card, small on disk. */
const MAX_EDGE = 1400;
const QUALITY = 0.72;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = fn(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Downscales and re-encodes a picked file. Also strips EXIF as a side effect of
 * going through a canvas — a photo shared to a table should not carry the
 * street it was taken on.
 */
export async function compressImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY),
  );
  if (!blob) throw new Error('Could not encode the photo');
  return { blob, width, height };
}

export async function putPhoto(id: string, blob: Blob): Promise<void> {
  await withStore('readwrite', (store) => store.put(blob, id));
}

export async function getPhoto(id: string): Promise<Blob | undefined> {
  try {
    return await withStore<Blob | undefined>('readonly', (store) => store.get(id));
  } catch {
    return undefined;
  }
}

export async function deletePhoto(id: string): Promise<void> {
  try {
    await withStore('readwrite', (store) => store.delete(id));
  } catch {
    /* the moment is going away regardless */
  }
}

/**
 * Object URLs must be revoked or the blob stays pinned in memory for the life
 * of the document, so callers get the URL and the cleanup together.
 */
export async function photoUrl(id: string): Promise<string | undefined> {
  const blob = await getPhoto(id);
  return blob ? URL.createObjectURL(blob) : undefined;
}
