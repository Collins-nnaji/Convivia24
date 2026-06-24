import { BlobServiceClient } from '@azure/storage-blob';
import sql from '@/lib/db';

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] as const;
export const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'] as const;
export const MEDIA_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;   // 10 MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;   // 50 MB

export type MediaPurpose =
  | 'event-cover'
  | 'face-enroll'
  | 'memory-wall'
  | 'lounge-avatar'
  | 'broadcast-attachment'
  | 'admin-media';

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
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
  };
  return map[contentType] || 'bin';
}

export function mediaTypeFromContentType(contentType: string): 'image' | 'video' {
  return contentType.startsWith('video/') ? 'video' : 'image';
}

export function validateMediaFile(file: { type: string; size: number }): string | null {
  if (!MEDIA_TYPES.includes(file.type as typeof MEDIA_TYPES[number])) {
    return 'Only JPEG, PNG, WebP, AVIF, GIF, MP4, MOV, and WebM files are allowed.';
  }
  const max = file.type.startsWith('video/') ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) {
    return file.type.startsWith('video/')
      ? 'Video must be under 50MB.'
      : 'Image must be under 10MB.';
  }
  return null;
}

export interface UploadResult {
  url: string;
  blobName: string;
  mediaType: 'image' | 'video';
  contentType: string;
  sizeBytes: number;
}

/** Upload bytes to Azure Blob Storage and record in `uploads`. */
export async function uploadBlob(
  buffer: Buffer,
  contentType: string,
  opts: {
    filename?: string;
    context?: string;
    purpose?: MediaPurpose;
    eventId?: string;
    userId?: string;
  } = {}
): Promise<UploadResult> {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr) throw new Error('Azure Storage is not configured (AZURE_STORAGE_CONNECTION_STRING).');

  const purpose = opts.purpose || 'admin-media';
  const prefix = opts.eventId
    ? `${purpose}/${opts.eventId}`
    : purpose;
  const ext = extensionFor(contentType, opts.filename);
  const blobName = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const service = BlobServiceClient.fromConnectionString(connStr);
  const containerClient = service.getContainerClient(containerName());
  await containerClient.createIfNotExists({ access: 'blob' });

  const block = containerClient.getBlockBlobClient(blobName);
  await block.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });

  const context = opts.context || purpose;
  await sql`
    INSERT INTO uploads (blob_name, url, filename, content_type, size_bytes, context)
    VALUES (${blobName}, ${block.url}, ${opts.filename || blobName}, ${contentType}, ${buffer.length}, ${context})
  `;

  return {
    url: block.url,
    blobName,
    mediaType: mediaTypeFromContentType(contentType),
    contentType,
    sizeBytes: buffer.length,
  };
}

/** @deprecated Use uploadBlob — kept for face enroll compatibility */
export async function uploadImage(
  buffer: Buffer,
  contentType: string,
  opts: { filename?: string; context?: string } = {}
): Promise<{ url: string; blobName: string }> {
  const result = await uploadBlob(buffer, contentType, {
    ...opts,
    purpose: opts.context === 'face-enroll' ? 'face-enroll' : 'admin-media',
  });
  return { url: result.url, blobName: result.blobName };
}
