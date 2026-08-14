'use client';

import { useEffect, useState } from 'react';
import { photoUrl } from '@/lib/moments/photos';

/**
 * Renders a photo held in IndexedDB. The object URL is created on mount and
 * revoked on unmount — without that the blob stays pinned in memory for the
 * life of the document, and a feed would leak every image you scrolled past.
 */
export default function MomentPhoto({
  photoId,
  ratio = 1,
  alt = '',
  className = '',
}: {
  photoId: string;
  ratio?: number;
  alt?: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    let revoked = false;
    let current: string | undefined;

    photoUrl(photoId).then((u) => {
      if (revoked) {
        if (u) URL.revokeObjectURL(u);
        return;
      }
      current = u;
      setUrl(u);
    });

    return () => {
      revoked = true;
      if (current) URL.revokeObjectURL(current);
    };
  }, [photoId]);

  return (
    <div
      className={`relative w-full overflow-hidden bg-obsidian/[0.06] ${className}`}
      style={{ aspectRatio: ratio || 1 }}
    >
      {url && (
        <img
          src={url}
          alt={alt}
          className="w-full h-full object-cover animate-[fadeIn_0.4s_ease-out]"
          decoding="async"
        />
      )}
    </div>
  );
}
