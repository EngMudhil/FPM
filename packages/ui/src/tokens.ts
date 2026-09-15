/**
 * FPM design tokens (Spec §6 + screenshot identity).
 * Authoritative CSS mirror: ./tokens.css
 */
export const fpmTokens = {
  color: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    mutedSurface: '#F8FAFC',
    hoverSurface: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textDisabled: '#94A3B8',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primaryPale: '#EFF6FF',
    success: '#0D9488',
    successDark: '#0F766E',
    successPale: '#F0FDFA',
    warning: '#D97706',
    warningDark: '#B45309',
    warningPale: '#FFFBEB',
    danger: '#DC2626',
    dangerDark: '#B91C1C',
    dangerPale: '#FEF2F2',
    cta: '#0F766E',
    ctaHover: '#115E59',
    metric: {
      yellow: '#FEF9C3',
      orange: '#FFEDD5',
      green: '#DCFCE7',
      teal: '#CCFBF1',
      purple: '#EDE9FE',
      pink: '#FCE7F3',
    },
  },
  radius: {
    control: '8px',
    card: '12px',
    dialog: '16px',
    pill: '999px',
  },
  space: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
  },
  typography: {
    pageTitle: { size: '24px', weight: 650 },
    sectionTitle: { size: '17px', weight: 600 },
    metric: { size: '28px', weight: 700 },
    body: { size: '14px', weight: 400 },
    table: { size: '13px', weight: 400 },
    supporting: { size: '12px', weight: 400 },
    tableHeader: { size: '11px', weight: 600, tracking: '0.04em' },
  },
  sidebarWidth: '260px',
} as const;

export type FpmTokens = typeof fpmTokens;
