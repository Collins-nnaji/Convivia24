import { BlobServiceClient } from '@azure/storage-blob';
import sql from '@/lib/db';

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export type MediaPurpose = 'stock-image' | 'admin-media' | 'event-cover' | 'party-invite';

export function blobConfigured(): boolean {
  return !!process.env.AZURE_STORAGE_CONNECTION_STRING;
}

function containerName(): string {
  return process.env.AZURE_STORAGE_CONTAINER || 'convivia24';
}

function extensionFor(contentType: string, filename?: string): string {
  const fromName = filename?.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
  };
  return map[contentType] || 'bin';
}

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!IMAGE_TYPES.includes(file.type as (typeof IMAGE_TYPES)[number])) {
    return 'Only JPEG, PNG, WebP, AVIF, and GIF images are allowed.';
  }
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be under 10MB.';
  return null;
}

export interface UploadResult {
  url: string;
  blobName: string;
  contentType: string;
  sizeBytes: number;
}

/** Upload bytes to Azure Blob Storage; optionally record in `uploads`. */
export async function uploadBlob(
  buffer: Buffer,
  contentType: string,
  opts: {
    filename?: string;
    purpose?: MediaPurpose;
    userId?: string;
  } = {}
): Promise<UploadResult> {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr) throw new Error('Azure Storage is not configured (AZURE_STORAGE_CONNECTION_STRING).');

  const purpose = opts.purpose || 'admin-media';
  const ext = extensionFor(contentType, opts.filename);
  const blobName = `${purpose}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const service = BlobServiceClient.fromConnectionString(connStr);
  const containerClient = service.getContainerClient(containerName());
  await containerClient.createIfNotExists();

  const block = containerClient.getBlockBlobClient(blobName);
  await block.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });

  const sas = (process.env.NEXT_PUBLIC_AZURE_DRINK_SAS || '').replace(/^\?/, '');
  const url = sas ? `${block.url}?${sas}` : block.url;

  try {
    await sql`
      INSERT INTO uploads (blob_name, url, filename, content_type, size_bytes, context)
      VALUES (
        ${blobName},
        ${url},
        ${opts.filename || blobName},
        ${contentType},
        ${buffer.length},
        ${purpose}
      )
    `;
  } catch {
    /* uploads table may be missing on fresh DBs — blob still lives in Azure */
  }

  return {
    url,
    blobName,
    contentType,
    sizeBytes: buffer.length,
  };
}
