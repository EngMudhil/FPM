import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
};

export function Alert({ className, tone = 'info', title, children, ...props }: AlertProps) {
  return (
    <div role="status" className={cn('fpm-alert', `fpm-alert--${tone}`, className)} {...props}>
      <div>
        {title ? <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong> : null}
        {children}
      </div>
    </div>
  );
}
