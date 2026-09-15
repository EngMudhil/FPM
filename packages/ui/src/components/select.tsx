import type { SelectHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn('fpm-select', className)} {...props}>
      {children}
    </select>
  );
}
