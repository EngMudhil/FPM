'use client';

import type { CSSProperties } from 'react';
import { SoftLink } from '@/components/soft-link';

export function PeriodNav({
  prevHref,
  nextHref,
  canPrev,
  canNext,
  prevLabel,
  nextLabel,
}: {
  prevHref: string;
  nextHref: string;
  canPrev: boolean;
  canNext: boolean;
  prevLabel: string;
  nextLabel: string;
}) {
  const btnStyle = (enabled: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    background: enabled ? '#fff' : '#F8FAFC',
    color: enabled ? '#0F172A' : '#CBD5E1',
    textDecoration: 'none',
    cursor: enabled ? 'pointer' : 'not-allowed',
    pointerEvents: enabled ? 'auto' : 'none',
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 700,
    position: 'relative',
    zIndex: 5,
    userSelect: 'none',
  });

  return (
    <div
      className="fpm-metric-card__nav"
      style={{
        display: 'inline-flex',
        gap: 6,
        position: 'relative',
        zIndex: 5,
        pointerEvents: 'auto',
      }}
    >
      {canPrev ? (
        <SoftLink
          href={prevHref}
          aria-label={prevLabel}
          title={prevLabel}
          style={btnStyle(true)}
          scroll={false}
          prefetch
        >
          ‹
        </SoftLink>
      ) : (
        <span aria-disabled="true" style={btnStyle(false)} title={prevLabel}>
          ‹
        </span>
      )}
      {canNext ? (
        <SoftLink
          href={nextHref}
          aria-label={nextLabel}
          title={nextLabel}
          style={btnStyle(true)}
          scroll={false}
          prefetch
        >
          ›
        </SoftLink>
      ) : (
        <span aria-disabled="true" style={btnStyle(false)} title={nextLabel}>
          ›
        </span>
      )}
    </div>
  );
}
