# iDrive e2 storage

Document uploads use iDrive e2 (S3-compatible). Set these in `.env`:

- `IDRIVE_ENDPOINT` – region endpoint host (no `https://`)
- `IDRIVE_BUCKET` – bucket name
- `IDRIVE_ACCESS_KEY` / `IDRIVE_SECRET_KEY` – from iDrive e2 dashboard
- `IDRIVE_REGION` – optional; auto-derived from endpoint if not set

## Regions (examples)

| Region (iDrive UI) | Endpoint                      | Region code  |
|--------------------|-------------------------------|--------------|
| Paris              | `s3.eu-west-3.idrivee2.com`   | eu-west-3    |
| **London-2**       | `s3.eu-west-2.idrivee2.com`  | eu-west-2    |
| London (uk-1)      | `s3.uk-1.idrivee2.com`       | uk-1         |

Use the exact endpoint iDrive shows for your bucket (e.g. after adding “Storage Region London-2”).

## London-2

For **London-2** set in `.env`:

```env
IDRIVE_ENDPOINT=s3.eu-west-2.idrivee2.com
IDRIVE_BUCKET=your-bucket-name
IDRIVE_ACCESS_KEY=...
IDRIVE_SECRET_KEY=...
```

If iDrive gives you a different host for London-2, use that and set `IDRIVE_REGION` to the region code they show (e.g. `eu-west-2`).
