// Azure Face client — detect a face in an image and compare two faces.
// Used by /api/face/enroll (selfie at checkout) and /api/face/identify
// (door scanner verifies against the ticket's enrolled face).
//
// Reference: Azure Face API v1.0 — POST /face/v1.0/detect and /verify.

const API_VER = '/face/v1.0';

export function faceConfigured(): boolean {
  return !!(process.env.AZURE_FACE_ENDPOINT && process.env.AZURE_FACE_KEY);
}

function endpoint(): string { return (process.env.AZURE_FACE_ENDPOINT || '').replace(/\/$/, ''); }
function headers(extra: Record<string, string> = {}): HeadersInit {
  return { 'Ocp-Apim-Subscription-Key': process.env.AZURE_FACE_KEY || '', ...extra };
}

interface DetectedFace { faceId: string; faceRectangle: { top: number; left: number; width: number; height: number } }

/**
 * Detect a face in `image` (raw bytes) and return its transient faceId.
 * Returns null if no face is found.
 */
export async function detectFace(image: Buffer): Promise<DetectedFace | null> {
  if (!faceConfigured()) throw new Error('Azure Face is not configured.');
  const url = `${endpoint()}${API_VER}/detect?returnFaceId=true&detectionModel=detection_03&recognitionModel=recognition_04`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/octet-stream' }),
    body: image as unknown as BodyInit,
  });
  if (!res.ok) throw new Error(`Face detect ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const arr = (await res.json()) as DetectedFace[];
  return arr[0] ?? null;
}

/**
 * Verify whether two transient face IDs belong to the same person.
 * Returns the confidence (0..1) and an `identical` boolean.
 */
export async function verifyFaces(faceId1: string, faceId2: string): Promise<{ identical: boolean; confidence: number }> {
  if (!faceConfigured()) throw new Error('Azure Face is not configured.');
  const res = await fetch(`${endpoint()}${API_VER}/verify`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ faceId1, faceId2 }),
  });
  if (!res.ok) throw new Error(`Face verify ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}
