import { describe, expect, it } from 'vitest';
import { firmCreateSchema, firmListQuerySchema } from './firms';

describe('firm validation', () => {
  it('requires name', () => {
    expect(() => firmCreateSchema.parse({ name: '  ' })).toThrow();
  });

  it('accepts valid firm', () => {
    expect(firmCreateSchema.parse({ name: ' FTMO ', website: '' })).toEqual({
      name: 'FTMO',
      website: undefined,
      notes: undefined,
    });
  });

  it('parses list query defaults', () => {
    expect(firmListQuerySchema.parse({})).toMatchObject({
      page: 1,
      pageSize: 20,
      sort: 'createdAt',
      sortDir: 'desc',
    });
  });
});
