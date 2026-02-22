import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

function getS3Client() {
  const endpoint = process.env.IDRIVE_ENDPOINT;
  const accessKey = process.env.IDRIVE_ACCESS_KEY;
  const secretKey = process.env.IDRIVE_SECRET_KEY;
  const bucket = process.env.IDRIVE_BUCKET;
  if (!endpoint || !accessKey || !secretKey || !bucket) {
    throw new Error('IDRIVE_ENDPOINT, IDRIVE_ACCESS_KEY, IDRIVE_SECRET_KEY, and IDRIVE_BUCKET must be set');
  }
  // iDrive e2: region must match endpoint. Examples: eu-west-3 (Paris), eu-west-2 (London-2), uk-1 (London)
  const regionMatch = endpoint.match(/s3\.([a-z0-9-]+)\.idrivee2\.com/i);
  const region = process.env.IDRIVE_REGION ?? regionMatch?.[1] ?? 'us-east-1';
  return new S3Client({
    endpoint: `https://${endpoint}`,
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    forcePathStyle: true,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const endpoint = process.env.IDRIVE_ENDPOINT;
  const bucket = process.env.IDRIVE_BUCKET;
  if (!endpoint || !bucket || !process.env.IDRIVE_ACCESS_KEY || !process.env.IDRIVE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Storage not configured. Set IDRIVE_ENDPOINT, IDRIVE_BUCKET, IDRIVE_ACCESS_KEY, IDRIVE_SECRET_KEY.' },
      { status: 503 }
    );
  }

  let body: { name?: string; type?: string; size?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { name, type, size } = body;
  if (!name || !type) return NextResponse.json({ error: 'Missing name or type' }, { status: 400 });

  const ext = name.split('.').pop() || 'bin';
  const key = `${randomUUID()}.${ext}`;

  try {
    const s3 = getS3Client();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: type,
      ...(size != null && size > 0 && { ContentLength: size }),
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    return NextResponse.json({ uploadUrl, key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate upload URL';
    console.error('[presign]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
