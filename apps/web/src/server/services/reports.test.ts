import { describe, expect, it } from 'vitest';
import { utcPeriodBounds } from '@fpm/financial';

describe('reports service wiring', () => {
  it('exposes period bounds for reports filters', () => {
    expect(utcPeriodBounds('year', new Date('2026-09-15T00:00:00.000Z'))?.start.toISOString()).toBe(
      '2026-01-01T00:00:00.000Z',
    );
  });
});
