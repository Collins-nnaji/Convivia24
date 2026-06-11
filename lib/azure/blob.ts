import { BlobServiceClient } from '@azure/storage-blob';
import sql from '@/lib/db';

export function blobConfigured(): boolean {
  return !!process.env.AZURE_STORAGE_CONNECTION_STRING;
}

/** Upload raw image bytes to Azure Blob storage and record it in `uploads`. */
export async function uploadImage(
  buffer: Buffer,
  contentType: string,
  opts: { filename?: string; context?: string } = {}
): Promise<{ url: string; blobName: string }> {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr) throw new Error('Azure Storage is not configured.');
  const container = process.env.AZURE_STORAGE_CONTAINER || 'convivia24-images';

  const service = BlobServiceClient.fromConnectionString(connStr);
  const containerClient = service.getContainerClient(container);
  await containerClient.createIfNotExists({ access: 'blob' });

  const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  const blobName = `${opts.context || 'img'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const block = containerClient.getBlockBlobClient(blobName);
  await block.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });

  await sql`
    INSERT INTO uploads (blob_name, url, filename, content_type, size_bytes, context)
    VALUES (${blobName}, ${block.url}, ${opts.filename || blobName}, ${contentType}, ${buffer.length}, ${opts.context || null})
  `;

  return { url: block.url, blobName };
}
