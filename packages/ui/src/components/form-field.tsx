import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({
  id,
  label,
  required,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('fpm-field', className)}>
      <label className="fpm-field__label" htmlFor={id}>
        {label}
        {required ? <span className="fpm-field__required">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="fpm-field__error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="fpm-field__hint">{hint}</p>
      ) : null}
    </div>
  );
}
