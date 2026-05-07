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

/** User-facing hint when Azure blocks Face (Verify needs approved Recognition access in many tenants). */
export function humanizeFaceHttpError(status: number, rawMessage: string, operation: 'detect' | 'verify'): string {
  const logged = rawMessage?.trim() || '';
  if (status === 401) {
    return 'Face API rejected your key (401). In Azure Portal → your Cognitive Services resource → Keys and Endpoint: use a key that matches that exact Endpoint URL (same resource).';
  }
  if (status === 403) {
    return `Face API access denied (403). Detection and Verify require Microsoft-approved Face Recognition access for your subscription—not just creating a resource. Open Azure Portal → your Face / Cognitive Services resource → confirm it’s active; if Verify is still blocked, submit Microsoft’s intake form: https://aka.ms/facerecognition (choose identity verification / 1:1 matching).`;
  }
  if (status === 404) {
    return `Face API endpoint not found (404). Set AZURE_FACE_ENDPOINT to the full base URL from Keys and Endpoint only—e.g. https://YOURNAME.cognitiveservices.azure.com with no path after .com`;
  }
  const short = logged.length > 180 ? `${logged.slice(0, 177)}…` : logged;
  return `Face ${operation} failed (${status}). ${short || 'See Azure Portal Face resource diagnostics.'}`;
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
    console.error('[azure-face] detect HTTP', res.status, err);
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      return { error: humanizeFaceHttpError(res.status, err, 'detect') };
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
    console.error('[azure-face] verify HTTP', verifyRes.status, err);
    if (verifyRes.status === 401 || verifyRes.status === 403 || verifyRes.status === 404) {
      return { ok: false, error: humanizeFaceHttpError(verifyRes.status, err, 'verify'), status: verifyRes.status };
    }
    return {
      ok: false,
      error: `Verification service error (${verifyRes.status}): ${err}`,
      status: verifyRes.status,
    };
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
