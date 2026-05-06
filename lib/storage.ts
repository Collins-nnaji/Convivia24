import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'convivia24-images';

function getContainerClient() {
  if (!connectionString) throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured.');
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(containerName);
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

  // Extract blob name from URL
  const url = new URL(blobUrl);
  const blobName = url.pathname.split('/').pop();
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
    if (urlContainer !== containerName) return null;
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
