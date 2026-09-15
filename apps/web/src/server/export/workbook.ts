import ExcelJS from 'exceljs';
import { sanitizeExcelCell } from './sanitize';

export type ExportColumn = {
  key: string;
  header: string;
  width?: number;
};

export async function buildWorkbookBuffer(input: {
  sheetName: string;
  columns: ExportColumn[];
  rows: Array<Record<string, string | number | null | undefined>>;
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FPM';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(input.sheetName.slice(0, 31), {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = input.columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width ?? Math.max(12, col.header.length + 2),
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8EEF5' },
  };

  for (const row of input.rows) {
    const values: Record<string, string | number> = {};
    for (const col of input.columns) {
      const raw = row[col.key];
      values[col.key] = typeof raw === 'number' ? raw : sanitizeExcelCell(raw);
    }
    sheet.addRow(values);
  }

  if (input.rows.length > 0) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: input.rows.length + 1, column: input.columns.length },
    };
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
