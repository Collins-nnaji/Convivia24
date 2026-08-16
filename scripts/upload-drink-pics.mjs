/**
 * Create/ensure Azure container (private) and upload public/DrinkPics/* under drink-pics/.
 * Storage accounts with "Public access not permitted" still work — we emit a read SAS base URL.
 * Usage: node --env-file=.env scripts/upload-drink-pics.mjs
 */
import {
  BlobServiceClient,
  ContainerSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  SASProtocol,
} from '@azure/storage-blob';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const picsDir = path.join(root, 'public', 'DrinkPics');
const envPath = path.join(root, '.env');

const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
const container = process.env.AZURE_STORAGE_CONTAINER || 'convivia24';
const endpoint = (process.env.AZURE_STORAGE_ENDPOINT || '').replace(/\/$/, '');

if (!conn) {
  console.error('Missing AZURE_STORAGE_CONNECTION_STRING');
  process.exit(1);
}

function parseConn(cs) {
  const parts = Object.fromEntries(
    cs.split(';').filter(Boolean).map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i), p.slice(i + 1)];
    })
  );
  return {
    accountName: parts.AccountName,
    accountKey: parts.AccountKey,
  };
}

const contentType = (name) => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'avif') return 'image/avif';
  return 'application/octet-stream';
};

const { accountName, accountKey } = parseConn(conn);
if (!accountName || !accountKey) {
  console.error('Connection string must include AccountName and AccountKey');
  process.exit(1);
}

const service = BlobServiceClient.fromConnectionString(conn);
const containerClient = service.getContainerClient(container);

try {
  const created = await containerClient.createIfNotExists();
  console.log(created.succeeded ? `Created container: ${container}` : `Using container: ${container}`);
} catch (err) {
  if (err?.statusCode === 409 || /ContainerAlreadyExists/i.test(String(err?.message))) {
    console.log(`Using existing container: ${container}`);
  } else {
    throw err;
  }
}

const files = (await readdir(picsDir)).filter((f) => !f.startsWith('.'));
console.log(`Uploading ${files.length} files from public/DrinkPics → ${container}/drink-pics/`);

let ok = 0;
for (const file of files) {
  const blobName = `drink-pics/${file}`;
  const block = containerClient.getBlockBlobClient(blobName);
  const buf = await readFile(path.join(picsDir, file));
  await block.uploadData(buf, {
    blobHTTPHeaders: {
      blobContentType: contentType(file),
      blobCacheControl: 'public, max-age=31536000',
    },
    overwrite: true,
  });
  ok += 1;
  console.log(`  ✓ ${blobName}`);
}

const startsOn = new Date();
const expiresOn = new Date();
expiresOn.setFullYear(expiresOn.getFullYear() + 5);

const sas = generateBlobSASQueryParameters(
  {
    containerName: container,
    permissions: ContainerSASPermissions.parse('rl'),
    startsOn,
    expiresOn,
    protocol: SASProtocol.Https,
  },
  new StorageSharedKeyCredential(accountName, accountKey)
).toString();

const host = endpoint || `https://${accountName}.blob.core.windows.net`;
const drinkBase = `${host}/${container}/drink-pics`;

const envLineBase = `NEXT_PUBLIC_AZURE_DRINK_BASE=${drinkBase}`;
const envLineSas = `NEXT_PUBLIC_AZURE_DRINK_SAS=${sas}`;

console.log(`\nDone. ${ok}/${files.length} uploaded.`);
console.log(`Container is private (account disallows anonymous). Using read SAS (5y).`);
console.log(`Add to .env:\n${envLineBase}\n${envLineSas}`);

// Upsert into .env without printing secrets in other logs
try {
  const fs = await import('node:fs/promises');
  let text = await fs.readFile(envPath, 'utf8');
  const upsert = (key, value) => {
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(text)) text = text.replace(re, `${key}=${value}`);
    else text = `${text.trimEnd()}\n${key}=${value}\n`;
  };
  upsert('NEXT_PUBLIC_AZURE_DRINK_BASE', drinkBase);
  upsert('NEXT_PUBLIC_AZURE_DRINK_SAS', sas);
  await fs.writeFile(envPath, text);
  console.log('Updated .env with NEXT_PUBLIC_AZURE_DRINK_BASE and NEXT_PUBLIC_AZURE_DRINK_SAS');
} catch (e) {
  console.warn('Could not write .env automatically:', e.message);
}
