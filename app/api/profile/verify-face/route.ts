import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { uploadFile } from '@/lib/storage';
import {
  AZURE_FACE_MAX_IMAGE_BYTES,
  azureFaceConfigured,
  detectFaceInImage,
  loadProfileAvatarBuffer,
  verifyFacePair,
} from '@/lib/azure-face';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!azureFaceConfigured()) {
    return NextResponse.json(
      { error: 'Face verification is not configured. Add AZURE_FACE_ENDPOINT and AZURE_FACE_KEY.' },
      { status: 503 }
    );
  }

  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);

    if (!user.avatar_url) {
      return NextResponse.json(
        { error: 'Upload a profile photo first before verifying.' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const selfie = formData.get('file') as File | null;
    if (!selfie) return NextResponse.json({ error: 'No selfie provided.' }, { status: 400 });
    if (selfie.size > AZURE_FACE_MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Selfie too large.' }, { status: 400 });
    }

    const selfieBuffer = Buffer.from(await selfie.arrayBuffer());

    const avatarBuffer = await loadProfileAvatarBuffer(String(user.avatar_url));
    if (!avatarBuffer) {
      return NextResponse.json(
        {
          error:
            'Could not read your profile photo from storage. Re-upload a headshot, or check AZURE_STORAGE_* env matches your blob container.',
        },
        { status: 422 }
      );
    }
    if (avatarBuffer.length > AZURE_FACE_MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Profile photo is too large. Upload a smaller headshot.' }, { status: 400 });
    }

    const selfieDetect = await detectFaceInImage(selfieBuffer, 'selfie');
    if ('error' in selfieDetect) return NextResponse.json({ error: selfieDetect.error }, { status: 422 });

    const profileDetect = await detectFaceInImage(avatarBuffer, 'profile photo');
    if ('error' in profileDetect) return NextResponse.json({ error: profileDetect.error }, { status: 422 });

    const verify = await verifyFacePair(selfieDetect.faceId, profileDetect.faceId);
    if (verify.ok === false) {
      const status = verify.status != null && verify.status >= 500 ? 502 : 422;
      return NextResponse.json(
        {
          error:
            verify.error ||
            'Face did not match your profile photo closely enough. Use a similar angle and lighting as your profile picture.',
        },
        { status }
      );
    }

    uploadFile(selfieBuffer, `verify-${user.id}-${Date.now()}.jpg`, 'image/jpeg').catch((err) => {
      console.error('Verification audit upload failed:', err);
    });

    const updated = await sql`
      UPDATE users SET verified = true WHERE id = ${user.id} RETURNING *
    `;

    return NextResponse.json({ verified: true, user: updated[0] });
  } catch (err) {
    console.error('Verify face error:', err);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
