import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { uploadFile, downloadBlobBufferFromUrl } from '@/lib/storage';

const FACE_ENDPOINT = process.env.AZURE_FACE_ENDPOINT;
const FACE_KEY = process.env.AZURE_FACE_KEY;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIN_CONFIDENCE = 0.55;

function faceApiUrl(path: string) {
  return `${FACE_ENDPOINT?.replace(/\/+$/, '')}/face/v1.0/${path}`;
}

async function azureErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.error?.message || data?.message || JSON.stringify(data);
  } catch {
    return res.text();
  }
}

async function detectFace(buffer: Buffer, label: string) {
  const res = await fetch(
    `${faceApiUrl('detect')}?returnFaceId=true&recognitionModel=recognition_04&detectionModel=detection_03`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': FACE_KEY!,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    }
  );

  if (!res.ok) {
    const err = await azureErrorMessage(res);
    console.error(`Face detect (${label}) error:`, err);
    return { error: `Could not detect a face in the ${label}. Try a clear, front-facing photo in better light.` };
  }

  const faces: any[] = await res.json();
  if (faces.length === 0) {
    return { error: `No face detected in the ${label}. Look directly at the camera and try again.` };
  }

  if (!faces[0].faceId) {
    return {
      error:
        'Azure detected a face but did not return a faceId. Your Face resource may need Face Identify/Verify limited-access approval enabled in Azure.',
    };
  }

  return { faceId: faces[0].faceId as string };
}

export async function POST(req: NextRequest) {
  if (!FACE_ENDPOINT || !FACE_KEY) {
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
    if (selfie.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Selfie too large.' }, { status: 400 });

    const selfieBuffer = Buffer.from(await selfie.arrayBuffer());

    async function loadProfilePhotoBuffer(url: string): Promise<Buffer | null> {
      try {
        const res = await fetch(url, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Convivia24-Server/1.0',
            Accept: 'image/*',
          },
        });
        if (!res.ok) return null;
        return Buffer.from(await res.arrayBuffer());
      } catch {
        return null;
      }
    }

    let avatarBuffer = await loadProfilePhotoBuffer(String(user.avatar_url));
    if (!avatarBuffer) {
      avatarBuffer = await downloadBlobBufferFromUrl(String(user.avatar_url));
    }
    if (!avatarBuffer) {
      return NextResponse.json(
        {
          error:
            'Could not read your profile photo. Re-upload a clear headshot, or ensure Azure blobs allow read access.',
        },
        { status: 422 }
      );
    }
    if (avatarBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Profile photo is too large. Upload a smaller headshot.' }, { status: 400 });
    }

    const selfieDetect = await detectFace(selfieBuffer, 'selfie');
    if (selfieDetect.error) return NextResponse.json({ error: selfieDetect.error }, { status: 422 });

    const profileDetect = await detectFace(avatarBuffer, 'profile photo');
    if (profileDetect.error) return NextResponse.json({ error: profileDetect.error }, { status: 422 });

    // Compare the two face IDs
    const verifyRes = await fetch(faceApiUrl('verify'), {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': FACE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ faceId1: selfieDetect.faceId, faceId2: profileDetect.faceId }),
    });

    if (!verifyRes.ok) {
      const err = await azureErrorMessage(verifyRes);
      console.error('Face verify error:', err);
      return NextResponse.json({ error: `Verification service error: ${err}` }, { status: 502 });
    }

    const result = await verifyRes.json();

    // Azure returns isIdentical + confidence (0-1). Keep threshold practical for mobile selfies.
    if (!result.isIdentical || result.confidence < MIN_CONFIDENCE) {
      return NextResponse.json(
        { error: `Face did not match your profile photo (confidence: ${Math.round((result.confidence || 0) * 100)}%). Make sure your profile photo is a clear headshot.` },
        { status: 422 }
      );
    }

    // Store audit selfie if Blob Storage is configured, but do not fail a successful face match.
    uploadFile(selfieBuffer, `verify-${user.id}-${Date.now()}.jpg`, 'image/jpeg').catch((err) => {
      console.error('Verification audit upload failed:', err);
    });

    // Mark the user as verified
    const updated = await sql`
      UPDATE users SET verified = true WHERE id = ${user.id} RETURNING *
    `;

    return NextResponse.json({ verified: true, user: updated[0] });
  } catch (err) {
    console.error('Verify face error:', err);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
