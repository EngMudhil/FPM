import { describe, expect, it } from 'vitest';
import { assertScaleSizes, resolveCurrentSizeFromScaleEvents } from './index';

describe('scale size rules', () => {
  it('requires toSize strictly greater than fromSize', () => {
    expect(() =>
      assertScaleSizes({ fromSize: '100000', toSize: '150000', currency: 'USD' }),
    ).not.toThrow();
    expect(() =>
      assertScaleSizes({ fromSize: '100000', toSize: '100000', currency: 'USD' }),
    ).toThrow(/toSize must be greater/);
    expect(() =>
      assertScaleSizes({ fromSize: '150000', toSize: '100000', currency: 'USD' }),
    ).toThrow(/toSize must be greater/);
  });

  it('rejects non-positive sizes', () => {
    expect(() => assertScaleSizes({ fromSize: '0', toSize: '100', currency: 'USD' })).toThrow(
      /greater than zero/,
    );
  });

  it('resolves currentSize from latest scaledAt then id', () => {
    expect(resolveCurrentSizeFromScaleEvents([], '50000')).toBe('50000');
    expect(
      resolveCurrentSizeFromScaleEvents(
        [
          { id: 'a', toSize: '100000', scaledAt: new Date('2026-01-01') },
          { id: 'b', toSize: '200000', scaledAt: new Date('2026-06-01') },
        ],
        '50000',
      ),
    ).toBe('200000');
    expect(
      resolveCurrentSizeFromScaleEvents(
        [
          { id: 'z', toSize: '110000', scaledAt: new Date('2026-03-01') },
          { id: 'y', toSize: '120000', scaledAt: new Date('2026-03-01') },
        ],
        '50000',
      ),
    ).toBe('110000');
  });
});
