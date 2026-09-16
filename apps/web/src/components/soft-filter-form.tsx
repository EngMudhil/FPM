'use client';

import { useTransition, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@fpm/ui';

/**
 * Soft client navigation for list/filter GET forms.
 * Keeps the authenticated shell mounted (no full document reload).
 */
export function SoftFilterForm({
  children,
  submitLabel = 'Filter',
  className,
  style,
  pendingLabel = 'Applying…',
}: {
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  style?: CSSProperties;
  pendingLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (typeof value !== 'string') continue;
      const trimmed = value.trim();
      if (!trimmed) continue;
      params.set(key, trimmed);
    }
    const qs = params.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <form method="get" onSubmit={onSubmit} className={className} style={style}>
      {children}
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
