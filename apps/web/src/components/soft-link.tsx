'use client';

import Link from 'next/link';
import type { FpmLinkProps } from '@fpm/ui';

/** App-wide Next.js soft navigation (no full document reload). */
export function SoftLink({ href, children, scroll = true, prefetch, ...rest }: FpmLinkProps) {
  return (
    <Link href={href} scroll={scroll} prefetch={prefetch} {...rest}>
      {children}
    </Link>
  );
}
