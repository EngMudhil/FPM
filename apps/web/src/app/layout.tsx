import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--fpm-font-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Funded Portfolio Manager',
  description: 'Private funded-trader portfolio management system',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Browser extensions (e.g. QuillBot `data-qb-installed`) often mutate <html>/<body>
    // before hydration; suppress known attribute mismatches on these root nodes only.
    <html lang="en" suppressHydrationWarning>
      <body className={font.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
