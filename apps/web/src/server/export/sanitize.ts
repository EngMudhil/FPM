/**
 * Spec §10: formula-injection protection for text beginning with =, +, -, or @.
 * Prefix with apostrophe-equivalent by prepending a single quote for Excel.
 */
export function sanitizeExcelCell(value: string | null | undefined): string {
  if (value == null) return '';
  const text = String(value);
  if (text.length === 0) return '';
  const first = text[0];
  if (first === '=' || first === '+' || first === '-' || first === '@' || first === '\t') {
    return `'${text}`;
  }
  return text;
}

export function sanitizeExcelRow(
  row: Record<string, string | number | null | undefined>,
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'number') {
      out[key] = value;
    } else {
      out[key] = sanitizeExcelCell(value);
    }
  }
  return out;
}
