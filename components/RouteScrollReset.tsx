'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Reset scroll when navigating — required because mobile uses #app-scroll, not window. */
export default function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.remove('drink-info-modal-open');
    document.body.style.overflow = '';

    const appScroll = document.getElementById('app-scroll');
    appScroll?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
