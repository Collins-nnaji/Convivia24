import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { uploadFile } from '@/lib/storage';

const FACE_ENDPOINT = process.env.AZURE_FACE_ENDPOINT;
const FACE_KEY = process.env.AZURE_FACE_KEY;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

    // Detect face in the selfie (uploaded as binary)
    const selfieDetect = await fetch(
      `${FACE_ENDPOINT}/face/v1.0/detect?returnFaceId=true&recognitionModel=recognition_04&detectionModel=detection_03`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': FACE_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: selfieBuffer,
      }
    );

    if (!selfieDetect.ok) {
      const err = await selfieDetect.text();
      console.error('Face detect (selfie) error:', err);
      return NextResponse.json({ error: 'Could not detect a face in the selfie. Try again in better light.' }, { status: 422 });
    }

    const selfieFaces: any[] = await selfieDetect.json();
    if (selfieFaces.length === 0) {
      return NextResponse.json({ error: 'No face detected in the selfie. Look directly at the camera.' }, { status: 422 });
    }
    const selfieFaceId = selfieFaces[0].faceId;

    // Detect face in the profile photo (fetch it as a URL)
    const dpDetect = await fetch(
      `${FACE_ENDPOINT}/face/v1.0/detect?returnFaceId=true&recognitionModel=recognition_04&detectionModel=detection_03`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': FACE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: user.avatar_url }),
      }
    );

    if (!dpDetect.ok) {
      const err = await dpDetect.text();
      console.error('Face detect (dp) error:', err);
      return NextResponse.json({ error: 'Could not read face from your profile photo. Try a clearer headshot.' }, { status: 422 });
    }

    const dpFaces: any[] = await dpDetect.json();
    if (dpFaces.length === 0) {
      return NextResponse.json({ error: 'No face found in your profile photo. Update your photo with a clear headshot and try again.' }, { status: 422 });
    }
    const dpFaceId = dpFaces[0].faceId;

    // Compare the two face IDs
    const verifyRes = await fetch(`${FACE_ENDPOINT}/face/v1.0/verify`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': FACE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ faceId1: selfieFaceId, faceId2: dpFaceId }),
    });

    if (!verifyRes.ok) {
      const err = await verifyRes.text();
      console.error('Face verify error:', err);
      return NextResponse.json({ error: 'Verification service error. Try again shortly.' }, { status: 502 });
    }

    const result = await verifyRes.json();

    // Azure returns isIdentical + confidence (0–1). Require ≥ 0.6 confidence.
    if (!result.isIdentical || result.confidence < 0.6) {
      return NextResponse.json(
        { error: `Face did not match your profile photo (confidence: ${Math.round((result.confidence || 0) * 100)}%). Make sure your profile photo is a clear headshot.` },
        { status: 422 }
      );
    }

    // Upload the selfie to Azure Blob for audit trail
    await uploadFile(selfieBuffer, `verify-${user.id}-${Date.now()}.jpg`, 'image/jpeg');

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
