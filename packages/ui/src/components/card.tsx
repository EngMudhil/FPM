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
  tone?: MetricTone;
  icon?: ReactNode;
  className?: string;
};

export function MetricCard({
  label,
  value,
  helper,
  tone = 'neutral',
  icon,
  className,
}: MetricCardProps) {
  return (
    <div className={cn('fpm-metric-card', `fpm-metric-card--${tone}`, className)}>
      {icon ? <div className="fpm-metric-card__icon">{icon}</div> : null}
      <div className="fpm-metric-card__label">{label}</div>
      <div className="fpm-metric-card__value">{value}</div>
      {helper ? <div className="fpm-metric-card__helper">{helper}</div> : null}
    </div>
  );
}
