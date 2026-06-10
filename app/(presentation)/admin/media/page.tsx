'use client';

import { useEffect, useState, useRef } from 'react';
import { Upload, X, Copy } from 'lucide-react';
import { useAdmin } from '../layout';

type UploadRecord = { id: string; blob_name: string; url: string; filename: string; content_type: string; size_bytes: number; context: string | null; created_at: string };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaAdmin() {
  const { secret } = useAdmin();
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [context, setContext] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 4000); }

  function load() {
    if (!secret) return;
    fetch('/api/upload', { headers: { 'x-admin-secret': secret } })
      .then(r => r.json())
      .then(d => { setUploads(d.uploads || []); setLoading(false); });
  }
  useEffect(load, [secret]);

  async function uploadFile(file: File) {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    if (context) fd.append('context', context);
    const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-secret': secret }, body: fd });
    const data = await res.json();
    if (res.ok) { flash(`Uploaded: ${data.url}`); load(); }
    else flash(data.error || 'Upload failed.');
    setUploading(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    flash('URL copied to clipboard.');
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a07c28]/50 mb-1">Management</p>
        <h1 className="text-3xl font-light italic text-obsidian mb-2">Media Library</h1>
        <p className="text-xs text-obsidian/30">Images are stored in Azure Blob Storage and served via CDN.</p>
      </div>

      {/* Upload zone */}
      <div className="mb-8">
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${dragOver ? 'border-[#c9a84c] bg-[#c9a84c]/5' : 'border-[#c9a84c]/20 hover:border-[#c9a84c]/40'}`}
        >
          <Upload size={24} className="text-[#a07c28]/40 mx-auto mb-3" />
          <p className="text-sm text-obsidian/50">{uploading ? 'Uploading…' : 'Drop an image here or click to browse'}</p>
          <p className="text-xs text-obsidian/20 mt-1">JPEG, PNG, WebP, AVIF · max 10MB</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input value={context} onChange={e => setContext(e.target.value)} placeholder="Context tag (e.g. menu, events, spaces)"
            className="flex-1 bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c] text-obsidian text-sm py-2 px-0 outline-none placeholder-obsidian/20" />
        </div>
        {msg && <p className="text-emerald-600 text-sm mt-3 bg-emerald-400/10 px-3 py-2 break-all">{msg}</p>}
      </div>

      {/* Uploads grid */}
      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="border border-[#c9a84c]/10 aspect-video animate-pulse" />)}
        </div>
      ) : uploads.length === 0 ? (
        <div className="border border-[#c9a84c]/10 p-10 text-center">
          <p className="text-obsidian/30 text-sm">No uploads yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {uploads.map(u => (
            <div key={u.id} className="border border-[#c9a84c]/10 overflow-hidden group">
              <div className="relative aspect-video bg-white">
                <img src={u.url} alt={u.filename} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(u.url)} className="flex items-center gap-1.5 bg-[#c9a84c] text-[#0a0a0a] text-[9px] font-black uppercase tracking-widest px-3 py-1.5">
                    <Copy size={10} /> Copy URL
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-obsidian/70 truncate">{u.filename}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-obsidian/30">{formatBytes(u.size_bytes)}</p>
                  {u.context && <p className="text-[9px] uppercase tracking-widest text-[#a07c28]/40">{u.context}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
