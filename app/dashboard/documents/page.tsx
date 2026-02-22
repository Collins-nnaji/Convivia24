'use client';

import { useEffect, useState, useRef } from 'react';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';

type Doc = {
  id: string;
  name: string;
  url: string;
  size_bytes: number;
  mime_type: string;
  created_at: string;
};

type Client = { id: string; name: string };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [me, setMe] = useState<{ role: string; clients?: Client[] } | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch('/api/documents');
    if (res.ok) setDocs(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch('/api/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.role === 'admin' && data?.clients?.length) {
          setMe(data);
          setSelectedClientId(data.clients[0].id);
        }
      })
      .catch(() => {});
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress('Requesting upload URL…');

    try {
      // 1. Get presigned URL
      const presignRes = await fetch('/api/documents/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
      });
      const presignData = await presignRes.json().catch(() => ({}));
      if (!presignRes.ok) {
        throw new Error(presignData?.error ?? `Failed to get upload URL (${presignRes.status})`);
      }
      const { uploadUrl, key } = presignData;

      // 2. Upload directly to iDrive
      setProgress('Uploading…');
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(`Storage upload failed (${uploadRes.status}). ${text.slice(0, 100)}`);
      }

      // 3. Save record
      setProgress('Saving…');
      const body: Record<string, unknown> = { name: file.name, key, size: file.size, type: file.type };
      if (me?.role === 'admin' && selectedClientId) body.clientId = selectedClientId;
      const saveRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const saveData = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) {
        throw new Error(saveData?.error ?? `Failed to save document (${saveRes.status})`);
      }

      setProgress('');
      await load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setProgress(`Error: ${message}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function deleteDoc(id: string) {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Documents
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
          Files & Reports
        </h1>
        <p className="text-zinc-600 text-sm mt-1">All documents shared with your account</p>
      </div>

      {/* Upload */}
      <div className="bg-white border border-zinc-200 border-dashed rounded-lg p-8 mb-6 text-center shadow-sm">
        <Upload size={24} className="mx-auto text-zinc-400 mb-3" />
        <p className="text-sm text-zinc-600 mb-3">Upload a document</p>
        {me?.role === 'admin' && (
          me.clients && me.clients.length > 0 ? (
            <div className="mb-3 flex justify-center">
              <label className="text-xs text-zinc-500 mr-2">Client:</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-1.5 rounded focus:outline-none focus:border-red-500"
              >
                {me.clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 mb-3">Create a client in Admin first, then upload.</p>
          )
        )}
        <input ref={fileRef} type="file" onChange={handleUpload} className="hidden" id="file-upload" />
        <label
          htmlFor="file-upload"
          className={`inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-black uppercase tracking-[0.1em] px-5 py-2.5 cursor-pointer transition-colors rounded ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {uploading ? progress || 'Uploading…' : 'Choose File'}
        </label>
      </div>

      {/* List */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900">
            {docs.length} Document{docs.length !== 1 ? 's' : ''}
          </h2>
        </div>
        {loading && <p className="text-zinc-500 text-sm text-center py-8">Loading…</p>}
        {!loading && docs.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-8">No documents yet.</p>
        )}
        <div className="divide-y divide-zinc-100">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={18} className="text-red-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{doc.name}</p>
                  <p className="text-[11px] text-zinc-500">
                    {formatBytes(doc.size_bytes)} · {new Date(doc.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                  title="Download"
                >
                  <Download size={15} />
                </a>
                <button
                  onClick={() => deleteDoc(doc.id)}
                  className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
