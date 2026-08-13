'use client';

import { useEffect, useRef, useState } from 'react';
import { getImage, imageKey, srcSetFor } from '@/lib/images';

/**
 * A photo that behaves on a phone: WebP renditions picked by `sizes`, a blurred
 * placeholder held underneath until the real file decodes, and a fade rather
 * than a pop. Falls back to the original `src` for anything not in the manifest.
 */
export default function SmartImage({
  src,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  wrapperClassName = '',
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  /** Set on the LCP image only — skips lazy-loading and hints the preloader. */
  priority?: boolean;
  wrapperClassName?: string;
}) {
  const asset = getImage(src);
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // A cached image can finish decoding before React attaches onLoad, in which
  // case the event never fires and the photo would stay invisible behind its
  // own placeholder. Catch that on mount.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  if (!asset) {
    return <img src={src} alt={alt} className={className} loading={priority ? 'eager' : 'lazy'} decoding="async" />;
  }

  const key = imageKey(src);

  return (
    <span className={`block relative overflow-hidden ${wrapperClassName}`}>
      <span
        aria-hidden
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundImage: `url("${asset.blur}")`, transform: 'scale(1.06)' }}
      />
      <img
        ref={ref}
        src={`/img/${key}-1280.webp`}
        srcSet={srcSetFor(src)}
        sizes={sizes}
        alt={alt}
        width={asset.width}
        height={asset.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`relative transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </span>
  );
}
