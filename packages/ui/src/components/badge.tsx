import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children: ReactNode;
};

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return <span className={cn('fpm-badge', `fpm-badge--${tone}`, className)} {...props} />;
}
