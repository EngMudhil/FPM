'use client';

import type { ReactNode } from 'react';
import { FpmLink } from './fpm-link';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="fpm-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span
            key={`${item.label}-${index}`}
            style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}
          >
            {index > 0 ? <span className="fpm-breadcrumbs__sep">/</span> : null}
            {item.href && !isLast ? (
              <FpmLink href={item.href} prefetch>
                {item.label}
              </FpmLink>
            ) : (
              <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className="fpm-page-header">
      <div>
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
        {eyebrow ? <p className="fpm-page-header__eyebrow">{eyebrow}</p> : null}
        <h1 className="fpm-page-header__title">{title}</h1>
        {description ? <p className="fpm-page-header__description">{description}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </header>
  );
}
