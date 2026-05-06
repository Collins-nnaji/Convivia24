import {
  downloadBlobBufferFromUrl,
  parseBlobNameFromAzureUrl,
  parseBlobNameFromProxyPath,
  readBlobBufferByName,
} from '@/lib/storage';

export const AZURE_FACE_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
/** Azure Verify returns confidence 0–1; tune to balance false rejects vs abuse (selfie vs profile is inherently noisy). */
export const AZURE_FACE_MIN_CONFIDENCE = 0.45;
export const AZURE_FACE_MATCH_WITHOUT_IDENTICAL_MIN = 0.52;

export function azureFaceConfigured(): boolean {
  return Boolean(process.env.AZURE_FACE_ENDPOINT?.trim() && process.env.AZURE_FACE_KEY?.trim());
}

function faceEndpointBase(): string {
  const raw = process.env.AZURE_FACE_ENDPOINT?.replace(/\/+$/, '');
  if (!raw) throw new Error('AZURE_FACE_ENDPOINT is not set');
  return raw;
}

function faceKey(): string {
  const k = process.env.AZURE_FACE_KEY?.trim();
  if (!k) throw new Error('AZURE_FACE_KEY is not set');
  return k;
}

function faceApiUrl(path: string) {
  return `${faceEndpointBase()}/face/v1.0/${path}`;
}

async function azureErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.error?.message || data?.error?.code || data?.message || JSON.stringify(data);
  } catch {
    return res.text();
  }
}

/** Pick the most prominent face (largest bounding box) — helps ID cards with multiple faces or glare. */
function pickPrimaryFace(faces: any[]): any | null {
  if (!faces?.length) return null;
  return faces.reduce((best, f) => {
    const br = (f.faceRectangle?.width || 0) * (f.faceRectangle?.height || 0);
    const bbr = (best.faceRectangle?.width || 0) * (best.faceRectangle?.height || 0);
    return br > bbr ? f : best;
  });
}

export type DetectResult = { faceId: string } | { error: string };

async function detectWithModel(
  buffer: Buffer,
  label: string,
  detectionModel: 'detection_03' | 'detection_02'
): Promise<Response> {
  const url = `${faceApiUrl('detect')}?returnFaceId=true&recognitionModel=recognition_04&detectionModel=${detectionModel}`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': faceKey(),
      'Content-Type': 'application/octet-stream',
    },
    body: buffer,
  });
}

export async function detectFaceInImage(buffer: Buffer, label: string): Promise<DetectResult> {
  let res = await detectWithModel(buffer, label, 'detection_03');

  if (!res.ok && res.status !== 401 && res.status !== 403) {
    const errText = await azureErrorMessage(res);
    if (/detectionModel|detection_03|not supported|invalid/i.test(errText)) {
      res = await detectWithModel(buffer, label, 'detection_02');
    } else {
      console.error(`Face detect (${label}) HTTP ${res.status}:`, errText);
      return { error: `Could not analyze the ${label}: ${errText}. Try a clearer, well-lit image.` };
    }
  }

  if (!res.ok) {
    const err = await azureErrorMessage(res);
    console.error(`Face detect (${label}) HTTP ${res.status}:`, err);
    if (res.status === 401 || res.status === 403) {
      return {
        error:
          'Azure Face API rejected the request (auth or access). Check AZURE_FACE_KEY and AZURE_FACE_ENDPOINT, and that Verify is enabled for your Face resource.',
      };
    }
    return { error: `Could not analyze the ${label}: ${err}. Try a clearer, well-lit image.` };
  }

  const faces: any[] = await res.json();
  const face = pickPrimaryFace(faces);
  if (!face) {
    return {
      error: `No face detected in the ${label}. Use a clear, front-facing shot with your whole face visible and good light.`,
    };
  }

  if (!face.faceId) {
    return {
      error:
        'Azure returned a face without faceId. Ensure your Face resource supports recognition_04 / Verify.',
    };
  }

  return { faceId: face.faceId as string };
}

export function matchPassesVerify(confidence: number, isIdentical: boolean): boolean {
  return (
    confidence >= AZURE_FACE_MIN_CONFIDENCE &&
    (isIdentical || confidence >= AZURE_FACE_MATCH_WITHOUT_IDENTICAL_MIN)
  );
}

export async function verifyFacePair(faceId1: string, faceId2: string): Promise<
  | { ok: true; confidence: number; isIdentical: boolean }
  | { ok: false; error: string; status?: number }
> {
  const verifyRes = await fetch(faceApiUrl('verify'), {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': faceKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ faceId1, faceId2 }),
  });

  if (!verifyRes.ok) {
    const err = await azureErrorMessage(verifyRes);
    return { ok: false, error: `Verification service error (${verifyRes.status}): ${err}`, status: verifyRes.status };
  }

  const result = await verifyRes.json();
  const confidence = Number(result.confidence ?? 0);
  const isIdentical = Boolean(result.isIdentical);
  if (!matchPassesVerify(confidence, isIdentical)) {
    return {
      ok: false,
      error: `Photos did not match closely enough (confidence: ${Math.round(confidence * 100)}%). Your profile picture should show the same person, in good light.`,
    };
  }

  return { ok: true, confidence, isIdentical };
}

export async function loadProfileAvatarBuffer(avatarUrl: string): Promise<Buffer | null> {
  const raw = avatarUrl.trim();

  const fromProxy = parseBlobNameFromProxyPath(raw);
  if (fromProxy) {
    const buf = await readBlobBufferByName(fromProxy);
    if (buf) return buf;
  }

  const fromAzureName = parseBlobNameFromAzureUrl(raw);
  if (fromAzureName) {
    const buf = await readBlobBufferByName(fromAzureName);
    if (buf) return buf;
  }

  const fromUrlSdk = await downloadBlobBufferFromUrl(raw);
  if (fromUrlSdk) return fromUrlSdk;

  try {
    const ac = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(20_000) : undefined;
    const res = await fetch(raw, {
      redirect: 'follow',
      signal: ac,
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
