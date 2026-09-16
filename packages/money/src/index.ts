import Decimal from 'decimal.js';
import { z } from 'zod';

/** ISO 4217 currency code (uppercase). */
export const currencyCodeSchema = z
  .string()
  .trim()
  .length(3)
  .regex(/^[A-Za-z]{3}$/)
  .transform((value) => value.toUpperCase());

export type CurrencyCode = z.infer<typeof currencyCodeSchema>;

/**
 * Monetary amount using exact decimal arithmetic (no JS number math).
 * Persist as PostgreSQL numeric; serialize as string.
 */
export class Money {
  readonly amount: Decimal;
  readonly currency: CurrencyCode;

  private constructor(amount: Decimal, currency: CurrencyCode) {
    if (!amount.isFinite()) {
      throw new Error('Money amount must be finite');
    }
    this.amount = amount;
    this.currency = currency;
  }

  static fromString(amount: string, currency: string): Money {
    const code = currencyCodeSchema.parse(currency);
    return new Money(new Decimal(amount), code);
  }

  static fromDecimal(amount: Decimal.Value, currency: string): Money {
    const code = currencyCodeSchema.parse(currency);
    return new Money(new Decimal(amount), code);
  }

  toString(): string {
    return this.amount.toFixed();
  }

  /** DB / JSON wire format — never use Number() for authority. */
  toJSON(): { amount: string; currency: CurrencyCode } {
    return { amount: this.toString(), currency: this.currency };
  }

  add(other: Money): Money {
    assertSameCurrency(this, other);
    return new Money(this.amount.plus(other.amount), this.currency);
  }

  sub(other: Money): Money {
    assertSameCurrency(this, other);
    return new Money(this.amount.minus(other.amount), this.currency);
  }

  isPositive(): boolean {
    return this.amount.greaterThan(0);
  }

  isNonNegative(): boolean {
    return this.amount.greaterThanOrEqualTo(0);
  }
}

export function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

export const moneyInputSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^-?\d+(\.\d+)?$/, 'Amount must be a decimal string'),
  currency: currencyCodeSchema,
});

export function parseMoneyInput(input: z.infer<typeof moneyInputSchema>): Money {
  return Money.fromString(input.amount, input.currency);
}

/**
 * Display-only formatting for UI. Never use for aggregation authority.
 * USD → `$8,900` / `$8,900.50`; other codes → `8,900 EUR`.
 *
 * Dashboard audit: funded totals use `decimals: 0` (+ compact ≥1M);
 * real-account totals use `decimals: 2` with `forceFraction: true`.
 */
export function formatDisplayMoney(
  amount: string,
  currency: string,
  opts?: {
    signed?: boolean;
    decimals?: number;
    forceFraction?: boolean;
    compact?: boolean;
  },
): string {
  const code = currencyCodeSchema.parse(currency);
  const value = new Decimal(amount);
  const decimals = opts?.decimals ?? 2;
  const rounded = value.toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP);
  const negative = rounded.isNegative();
  const abs = rounded.abs();

  if (opts?.compact && abs.greaterThanOrEqualTo(1_000_000)) {
    const millions = abs.div(1_000_000);
    const compact = millions.toFixed(millions.modulo(1).isZero() ? 0 : 1);
    const sign = opts?.signed ? (negative ? '−' : value.isZero() ? '' : '+') : negative ? '−' : '';
    if (code === 'USD') return `${sign}$${compact}M`;
    return `${sign}${compact}M ${code}`;
  }

  const fixed = abs.toFixed(decimals);
  const [intRaw = '0', fracRaw = decimals === 0 ? '' : '0'.repeat(decimals)] = fixed.split('.');
  const intPart = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  let frac = '';
  if (decimals > 0) {
    if (opts?.forceFraction) {
      frac = `.${fracRaw}`;
    } else if (fracRaw.replace(/0/g, '') !== '') {
      frac = `.${fracRaw.replace(/0+$/, '')}`;
    }
  }
  const core = `${intPart}${frac}`;
  const sign = opts?.signed ? (negative ? '−' : value.isZero() ? '' : '+') : negative ? '−' : '';
  if (code === 'USD') return `${sign}$${core}`;
  return `${sign}${core} ${code}`;
}

export function formatDisplayPercent(value: string): string {
  if (value === 'N/A' || value === '—') return value;
  const cleaned = value.replace(/%/g, '').trim();
  const d = new Decimal(cleaned);
  return `${d.toFixed(2)}%`;
}
