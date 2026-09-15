import { describe, expect, it } from 'vitest';
import { sanitizeExcelCell, sanitizeExcelRow } from './sanitize';

describe('excel injection sanitize', () => {
  it('prefixes formula-like text', () => {
    expect(sanitizeExcelCell('=CMD()')).toBe("'=CMD()");
    expect(sanitizeExcelCell('+1+1')).toBe("'+1+1");
    expect(sanitizeExcelCell('-1+1')).toBe("'-1+1");
    expect(sanitizeExcelCell('@SUM(A1)')).toBe("'@SUM(A1)");
    expect(sanitizeExcelCell('normal')).toBe('normal');
    expect(sanitizeExcelCell(null)).toBe('');
  });

  it('preserves numeric cells', () => {
    expect(sanitizeExcelRow({ n: 12, t: '=x' })).toEqual({ n: 12, t: "'=x" });
  });
});
