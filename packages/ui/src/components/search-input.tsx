import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Input } from './input';

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className={cn('fpm-search', className)}>
      <span className="fpm-search__icon" aria-hidden>
        ⌕
      </span>
      <Input type="search" {...props} />
    </div>
  );
}
