import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getAppUser } from '@/lib/auth/session';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sql from '@/lib/db';

const s3 = new S3Client({
  endpoint: `https://${process.env.IDRIVE_ENDPOINT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.IDRIVE_ACCESS_KEY!,
    secretAccessKey: process.env.IDRIVE_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appUser = await getAppUser({ id: session.user.id, email: session.user.email!, name: session.user.name, image: session.user.image });

  const [doc] = await sql`SELECT * FROM documents WHERE id = ${id}`;
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Delete from iDrive
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.IDRIVE_BUCKET!, Key: String(doc.idrive_key) }));

  // Delete from DB
  await sql`DELETE FROM documents WHERE id = ${id}`;

  return NextResponse.json({ ok: true });
}
