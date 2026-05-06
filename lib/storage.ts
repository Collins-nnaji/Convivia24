import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
export const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER || 'convivia24-images';

function getContainerClient() {
  if (!connectionString) throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured.');
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);
}

/** Resolve blob name in our container from a direct Azure URL (e.g. for delete). */
/** Legacy rows may store `/api/blob/...` from an older proxy; resolve blob name for SDK download. */
export function parseBlobNameFromProxyPath(stored: string): string | null {
  const t = stored.trim();
  if (!t.startsWith('/api/blob/')) return null;
  return t
    .slice('/api/blob/'.length)
    .split('/')
    .map((p) => decodeURIComponent(p))
    .join('/');
}

export async function readBlobBufferByName(blobName: string): Promise<Buffer | null> {
  if (!connectionString || !blobName || blobName.includes('..')) return null;
  try {
    const blobClient = getContainerClient().getBlobClient(blobName);
    const download = await blobClient.download();
    if (!download.readableStreamBody) return null;
    const chunks: Buffer[] = [];
    for await (const chunk of download.readableStreamBody) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch (err) {
    console.error('[storage] readBlobBufferByName:', err);
    return null;
  }
}

export function parseBlobNameFromAzureUrl(blobUrl: string): string | null {
  try {
    const url = new URL(blobUrl.trim());
    if (!url.hostname.endsWith('.blob.core.windows.net')) return null;
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length < 2) return null;
    const [c, ...rest] = segments;
    if (c !== AZURE_STORAGE_CONTAINER_NAME) return null;
    return rest.join('/');
  } catch {
    return null;
  }
}

/**
 * Upload a file buffer to Azure Blob Storage.
 * Returns the public URL of the uploaded blob.
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const containerClient = getContainerClient();

  // Ensure container exists
  await containerClient.createIfNotExists({ access: 'blob' });

  const blobName = `${Date.now()}-${filename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return blockBlobClient.url;
}

/**
 * Delete a blob from Azure storage by its URL or blob name.
 */
export async function deleteFile(blobUrl: string): Promise<void> {
  const containerClient = getContainerClient();
  let blobName = parseBlobNameFromAzureUrl(blobUrl);
  if (!blobName) {
    try {
      const url = new URL(blobUrl);
      blobName = url.pathname.split('/').filter(Boolean).pop() || null;
    } catch {
      blobName = null;
    }
  }
  if (!blobName) return;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
}

/**
 * Download a blob using the storage account SDK (for verify-face when public HTTP fetch fails).
 * Expects URL like https://{account}.blob.core.windows.net/{container}/{blobKey...}
 */
export async function downloadBlobBufferFromUrl(blobUrl: string): Promise<Buffer | null> {
  if (!connectionString) return null;
  try {
    const url = new URL(blobUrl);
    if (!url.hostname.endsWith('.blob.core.windows.net')) return null;
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length < 2) return null;
    const [urlContainer, ...blobPathParts] = segments;
    if (urlContainer !== AZURE_STORAGE_CONTAINER_NAME) return null;
    const blobName = blobPathParts.join('/');
    if (!blobName) return null;

    const containerClient = getContainerClient();
    const blobClient = containerClient.getBlobClient(blobName);
    const download = await blobClient.download();
    if (!download.readableStreamBody) return null;

    const chunks: Buffer[] = [];
    for await (const chunk of download.readableStreamBody) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch (err) {
    console.error('[storage] downloadBlobBufferFromUrl:', err);
    return null;
  }
}
