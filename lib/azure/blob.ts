import { randomUUID } from 'node:crypto';
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
  if (file.size <= 0) return 'Image is empty.';
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

  const error = validateImageFile({ type: contentType, size: buffer.length });
  if (error) throw new Error(error);
  if (!imageSignatureMatches(buffer, contentType)) throw new Error('Image contents do not match the selected file type.');
  const purpose = opts.purpose || 'admin-media';
  const ext = extensionFor(contentType, opts.filename);
  const blobName = `${purpose}/${Date.now()}-${randomUUID()}.${ext}`;

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

/** Reject executable/text uploads disguised with an image extension or MIME header. */
export function imageSignatureMatches(bytes: Buffer, type: string): boolean {
  if (type === 'image/jpeg') return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes.length > 8 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (type === 'image/gif') return ['GIF87a','GIF89a'].includes(bytes.subarray(0,6).toString());
  if (type === 'image/webp') return bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP';
  if (type === 'image/avif') return bytes.subarray(4,8).toString() === 'ftyp' && /avif|avis/.test(bytes.subarray(8,32).toString());
  return false;
}
