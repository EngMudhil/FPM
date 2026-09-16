import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('fpm-card', className)} {...props} />;
}

export type MetricTone = 'yellow' | 'orange' | 'green' | 'teal' | 'purple' | 'pink' | 'neutral';

export type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  helperTone?: 'danger' | 'muted';
  tone?: MetricTone;
  icon?: ReactNode;
  badge?: ReactNode;
  headerRight?: ReactNode;
  accentValue?: boolean;
  className?: string;
};

export function MetricCard({
  label,
  value,
  helper,
  helperTone = 'muted',
  tone = 'neutral',
  icon,
  badge,
  headerRight,
  accentValue = false,
  className,
}: MetricCardProps) {
  return (
    <div className={cn('fpm-metric-card', `fpm-metric-card--${tone}`, className)}>
      <div className="fpm-metric-card__top">
        {icon ? <div className="fpm-metric-card__icon">{icon}</div> : <span />}
        <div className="fpm-metric-card__top-right">
          {badge}
          {headerRight}
        </div>
      </div>
      <div className="fpm-metric-card__label">{label}</div>
      <div
        className={cn('fpm-metric-card__value', accentValue && 'fpm-metric-card__value--accent')}
      >
        {value}
      </div>
      {helper ? (
        <div
          className={cn(
            'fpm-metric-card__helper',
            helperTone === 'danger' && 'fpm-metric-card__helper--danger',
          )}
        >
          {helper}
        </div>
      ) : null}
    </div>
  );
}
