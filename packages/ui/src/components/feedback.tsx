import type { ReactNode } from 'react';
import { Button } from './button';

export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="fpm-empty" role="status">
      {icon}
      <h2 className="fpm-empty__title">{title}</h2>
      {description ? <p className="fpm-empty__description">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again. If the problem continues, contact support.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="fpm-error-state" role="alert">
      <h2 className="fpm-error-state__title">{title}</h2>
      <p className="fpm-error-state__description">{description}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export type LoadingSkeletonProps = {
  width?: string | number;
  height?: string | number;
  className?: string;
};

export function LoadingSkeleton({ width = '100%', height = 16, className }: LoadingSkeletonProps) {
  return (
    <span
      className={className ? `fpm-skeleton ${className}` : 'fpm-skeleton'}
      style={{ width, height, display: 'inline-block' }}
      aria-hidden
    />
  );
}
