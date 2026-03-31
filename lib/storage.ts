import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'convivia24-images';

function getContainerClient() {
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
