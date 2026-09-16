'use client';

import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { createContext, useContext } from 'react';

export type FpmLinkProps = {
  href: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
  onClick?: () => void;
  'aria-label'?: string;
  'aria-current'?: 'page' | undefined;
  /** Next.js Link: keep scroll position (default true). Ignored by native anchors. */
  scroll?: boolean;
  prefetch?: boolean;
};

export type FpmLinkComponent = ComponentType<FpmLinkProps>;

function NativeLink({
  href,
  children,
  scroll: _scroll,
  prefetch: _prefetch,
  ...rest
}: FpmLinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

const FpmLinkContext = createContext<FpmLinkComponent>(NativeLink);

export function FpmLinkProvider({
  linkComponent,
  children,
}: {
  linkComponent: FpmLinkComponent;
  children: ReactNode;
}) {
  return <FpmLinkContext.Provider value={linkComponent}>{children}</FpmLinkContext.Provider>;
}

export function useFpmLink(): FpmLinkComponent {
  return useContext(FpmLinkContext);
}

/** Renders through the provided soft-link component (Next Link in the web app). */
export function FpmLink(props: FpmLinkProps) {
  const Link = useFpmLink();
  return <Link {...props} />;
}
