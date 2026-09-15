import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn('fpm-textarea', className)} {...props} />;
}
