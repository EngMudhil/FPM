import { describe, expect, it } from 'vitest';
import { assertScaleSizes, resolveCurrentSizeFromScaleEvents } from '@fpm/financial';

describe('scale event domain wiring', () => {
  it('exposes financial scale helpers for service layer', () => {
    expect(() =>
      assertScaleSizes({ fromSize: '50', toSize: '100', currency: 'USD' }),
    ).not.toThrow();
    expect(resolveCurrentSizeFromScaleEvents([], '50')).toBe('50');
  });
});
